import { randomToken } from './encoding';
import { LocalSyncError } from './errors';
import { isPeerSignal } from './signal';
import type { LocalSyncSession, PeerSignal } from './types';

export type RelayRole = 'host' | 'guest';

export type RelayPairingStatus =
  | 'connecting'
  | 'waiting'
  | 'signaling'
  | 'connected'
  | 'failed'
  | 'closed';

export interface RelayPairingOptions {
  /** Base URL of the signaling Worker, for example https://sync.example.workers.dev */
  relayUrl: string;
  role: RelayRole;
  session: LocalSyncSession;
  /** Hosts generate one; guests must pass the room from the scanned link. */
  room?: string;
  /** App URL encoded in the host QR. Defaults to the current page. */
  appUrl?: string;
  /** Injected in tests; defaults to `new WebSocket(url)`. */
  socketFactory?: (url: string) => WebSocket;
  onStatus?: (status: RelayPairingStatus) => void;
  onError?: (error: LocalSyncError) => void;
}

export interface RelayPairing {
  readonly room: string;
  readonly role: RelayRole;
  readonly pairUrl: string;
  readonly status: RelayPairingStatus;
  onStatus(listener: (status: RelayPairingStatus) => void): () => void;
  close(): void;
}

type RelayServerMessage =
  | { type: 'ready'; role: RelayRole }
  | { type: 'peer-joined' }
  | { type: 'peer-left' }
  | { type: 'offer'; payload: unknown }
  | { type: 'answer'; payload: unknown }
  | { type: 'pong' }
  | { type: 'error'; message?: string };

const ROOM_PATTERN = /^[A-Za-z0-9_-]{16,64}$/;
const SOCKET_OPEN = 1;

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function asSyncError(error: unknown, code: LocalSyncError['code'] = 'signal') {
  return error instanceof LocalSyncError
    ? error
    : new LocalSyncError(messageOf(error), code, { cause: error });
}

function defaultAppUrl(): string {
  if (typeof window === 'undefined' || !window.location) {
    return 'http://localhost:3201/';
  }
  return `${window.location.origin}${window.location.pathname}`;
}

/** Builds the URL encoded in the host QR; the room is in the hash. */
export function buildPairUrl(appUrl: string, room: string): string {
  const url = new URL(appUrl);
  url.hash = `sync=${room}`;
  return url.toString();
}

/** Returns the room from a pair URL or a bare room code. */
export function parsePairingCode(value: string): string | null {
  const text = value.trim();
  if (!text) return null;
  if (ROOM_PATTERN.test(text)) return text;
  try {
    const url = new URL(text);
    const hash = new URLSearchParams(url.hash.replace(/^#/, ''));
    const room = hash.get('sync') ?? url.searchParams.get('sync');
    return room && ROOM_PATTERN.test(room) ? room : null;
  } catch {
    return null;
  }
}

/** Converts the relay base URL to its WebSocket endpoint. */
export function relaySocketUrl(
  relayUrl: string,
  room: string,
  role: RelayRole,
): string {
  const url = new URL('/ws', relayUrl);
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  url.searchParams.set('room', room);
  url.searchParams.set('role', role);
  return url.toString();
}

function parseRelayMessage(raw: unknown): RelayServerMessage | null {
  if (typeof raw !== 'string') return null;
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof value !== 'object' || value === null) return null;
  const message = value as { type?: unknown; role?: unknown; payload?: unknown };
  if (message.type === 'ready') {
    return message.role === 'host' || message.role === 'guest'
      ? { type: 'ready', role: message.role }
      : null;
  }
  if (
    message.type === 'peer-joined' ||
    message.type === 'peer-left' ||
    message.type === 'pong'
  ) {
    return { type: message.type };
  }
  if (message.type === 'offer' || message.type === 'answer') {
    return { type: message.type, payload: message.payload };
  }
  if (message.type === 'error') {
    const messageValue = (value as { message?: unknown }).message;
    return {
      type: 'error',
      message:
        typeof messageValue === 'string'
          ? messageValue
          : 'The pairing relay reported an error',
    };
  }
  return null;
}

class RelayClient implements RelayPairing {
  readonly room: string;
  readonly role: RelayRole;
  readonly pairUrl: string;

  private readonly options: RelayPairingOptions;
  private socket: WebSocket | null = null;
  private currentStatus: RelayPairingStatus = 'connecting';
  private readonly statusListeners = new Set<
    (status: RelayPairingStatus) => void
  >();
  private offSessionState: (() => void) | null = null;
  private readyReceived = false;
  private pendingOffer: PeerSignal | null = null;
  private offerResolve: ((signal: PeerSignal) => void) | null = null;
  private offerReject: ((error: Error) => void) | null = null;
  private readyResolve: (() => void) | null = null;
  private readyReject: ((error: Error) => void) | null = null;
  private offerTimer: ReturnType<typeof setTimeout> | null = null;
  private readyTimer: ReturnType<typeof setTimeout> | null = null;
  private connectionTimer: ReturnType<typeof setTimeout> | null = null;
  private answerSent = false;
  private closed = false;

  constructor(options: RelayPairingOptions) {
    this.options = options;
    this.role = options.role;
    this.room = options.room ?? randomToken(18);
    if (!ROOM_PATTERN.test(this.room)) {
      throw new LocalSyncError('Invalid pairing room', 'signal');
    }
    this.pairUrl = buildPairUrl(options.appUrl ?? defaultAppUrl(), this.room);
  }

  get status(): RelayPairingStatus {
    return this.currentStatus;
  }

  async connect(): Promise<void> {
    const socket = this.options.socketFactory
      ? this.options.socketFactory(
          relaySocketUrl(this.options.relayUrl, this.room, this.role),
        )
      : new WebSocket(
          relaySocketUrl(this.options.relayUrl, this.room, this.role),
        );
    this.socket = socket;
    this.attach(socket);

    this.offSessionState = this.options.session.onStateChange((state) => {
      if (state === 'connected') {
        this.clearConnectionTimer();
        this.setStatus('connected');
        this.closeSocket();
      } else if (state === 'failed') {
        this.fail(
          new LocalSyncError('The direct connection failed', 'webrtc'),
        );
      }
    });

    await this.waitForReady();
    this.assertActive();

    if (this.role === 'host') {
      const offer = await this.options.session.createOffer();
      this.send({ type: 'offer', payload: offer });
      this.setStatus('waiting');
      return;
    }

    this.setStatus('waiting');
    const offer = await this.waitForOffer();
    this.assertActive();
    this.setStatus('signaling');
    const answer = await this.options.session.acceptOffer(offer);
    this.send({ type: 'answer', payload: answer });
    this.answerSent = true;
    this.startConnectionTimer();
  }

  onStatus(listener: (status: RelayPairingStatus) => void): () => void {
    this.statusListeners.add(listener);
    listener(this.currentStatus);
    return () => this.statusListeners.delete(listener);
  }

  close(): void {
    if (this.closed) return;
    this.closed = true;
    this.setStatus('closed');
    this.offSessionState?.();
    this.offSessionState = null;
    this.clearWaiters(new LocalSyncError('Pairing was closed', 'signal'));
    this.closeSocket();
  }

  private attach(socket: WebSocket): void {
    socket.addEventListener('message', (event) => {
      const message = parseRelayMessage(
        typeof event.data === 'string' ? event.data : null,
      );
      if (!message) return;
      this.handleMessage(message);
    });
    socket.addEventListener('close', () => {
      if (this.closed || this.answerSent) return;
      this.fail(new LocalSyncError('The pairing relay disconnected', 'signal'));
    });
    socket.addEventListener('error', () => {
      this.fail(new LocalSyncError('Could not reach the pairing relay', 'signal'));
    });
  }

  private handleMessage(message: RelayServerMessage): void {
    if (message.type === 'ready') {
      this.readyReceived = true;
      this.clearReadyTimer();
      this.readyResolve?.();
      this.readyResolve = null;
      this.readyReject = null;
      return;
    }
    if (message.type === 'offer') {
      if (this.role !== 'guest') return;
      if (!isPeerSignal(message.payload) || message.payload.kind !== 'offer') {
        this.fail(new LocalSyncError('The relay sent an invalid offer', 'signal'));
        return;
      }
      if (this.offerResolve) {
        const resolve = this.offerResolve;
        this.offerResolve = null;
        this.offerReject = null;
        this.clearOfferTimer();
        resolve(message.payload);
      } else {
        this.pendingOffer = message.payload;
      }
      return;
    }
    if (message.type === 'answer') {
      if (this.role !== 'host') return;
      if (!isPeerSignal(message.payload) || message.payload.kind !== 'answer') {
        this.fail(
          new LocalSyncError('The relay sent an invalid answer', 'signal'),
        );
        return;
      }
      void this.acceptAnswer(message.payload);
      return;
    }
    if (message.type === 'peer-joined') {
      if (this.currentStatus === 'waiting') this.setStatus('signaling');
      return;
    }
    if (message.type === 'peer-left') {
      if (this.role === 'guest') {
        if (!this.answerSent) {
          this.fail(
            new LocalSyncError('The host closed the pairing room', 'signal'),
          );
        }
      } else if (this.currentStatus !== 'connected') {
        this.setStatus('waiting');
      }
      return;
    }
    if (message.type === 'error') {
      this.fail(
        new LocalSyncError(message.message ?? 'Pairing relay error', 'signal'),
      );
    }
  }

  private async acceptAnswer(answer: PeerSignal): Promise<void> {
    this.setStatus('signaling');
    try {
      await this.options.session.acceptAnswer(answer);
      this.startConnectionTimer();
    } catch (error) {
      this.fail(asSyncError(error, 'webrtc'));
    }
  }

  private waitForReady(): Promise<void> {
    if (this.closed || this.currentStatus === 'failed') {
      return Promise.reject(
        new LocalSyncError('The pairing relay is not available', 'signal'),
      );
    }
    if (this.readyReceived) return Promise.resolve();
    return new Promise((resolve, reject) => {
      this.readyResolve = resolve;
      this.readyReject = reject;
      this.readyTimer = setTimeout(() => {
        this.fail(
          new LocalSyncError('The pairing relay did not respond', 'signal'),
        );
      }, 10_000);
    });
  }

  private waitForOffer(): Promise<PeerSignal> {
    if (this.closed || this.currentStatus === 'failed') {
      return Promise.reject(
        new LocalSyncError('The pairing relay is not available', 'signal'),
      );
    }
    if (this.pendingOffer) {
      const offer = this.pendingOffer;
      this.pendingOffer = null;
      return Promise.resolve(offer);
    }
    return new Promise((resolve, reject) => {
      this.offerResolve = resolve;
      this.offerReject = reject;
      this.offerTimer = setTimeout(() => {
        this.fail(
          new LocalSyncError(
            'The host is offline or the pairing link expired',
            'signal',
          ),
        );
      }, 30_000);
    });
  }

  private assertActive(): void {
    if (this.closed) {
      throw new LocalSyncError('Pairing was closed', 'signal');
    }
    if (this.currentStatus === 'failed') {
      throw new LocalSyncError('The pairing relay is not available', 'signal');
    }
  }

  private send(message: { type: 'offer' | 'answer'; payload: PeerSignal }): void {
    if (!this.socket || this.socket.readyState !== SOCKET_OPEN) {
      throw new LocalSyncError('The pairing relay is not open', 'signal');
    }
    this.socket.send(JSON.stringify(message));
  }

  private fail(error: LocalSyncError): void {
    if (
      this.closed ||
      this.currentStatus === 'connected' ||
      this.currentStatus === 'failed'
    ) {
      return;
    }
    this.setStatus('failed');
    this.options.onError?.(error);
    this.clearWaiters(error);
    this.closeSocket();
  }

  private clearWaiters(error: Error): void {
    this.clearReadyTimer();
    this.clearOfferTimer();
    this.clearConnectionTimer();
    this.readyReject?.(error);
    this.offerReject?.(error);
    this.readyResolve = null;
    this.readyReject = null;
    this.offerResolve = null;
    this.offerReject = null;
  }

  private clearReadyTimer(): void {
    if (this.readyTimer !== null) {
      clearTimeout(this.readyTimer);
      this.readyTimer = null;
    }
  }

  private startConnectionTimer(): void {
    this.clearConnectionTimer();
    this.connectionTimer = setTimeout(() => {
      this.fail(
        new LocalSyncError(
          'The direct connection timed out. Check that both devices are on the same network.',
          'timeout',
        ),
      );
    }, 30_000);
  }

  private clearConnectionTimer(): void {
    if (this.connectionTimer !== null) {
      clearTimeout(this.connectionTimer);
      this.connectionTimer = null;
    }
  }

  private clearOfferTimer(): void {
    if (this.offerTimer !== null) {
      clearTimeout(this.offerTimer);
      this.offerTimer = null;
    }
  }

  private closeSocket(): void {
    const socket = this.socket;
    this.socket = null;
    if (socket) {
      try {
        socket.close();
      } catch {
        /* Already closed. */
      }
    }
  }

  private setStatus(next: RelayPairingStatus): void {
    if (this.currentStatus === next) return;
    this.currentStatus = next;
    for (const listener of this.statusListeners) listener(next);
    this.options.onStatus?.(next);
  }
}

/** Starts a relay-backed pairing room and returns once the first signal is sent. */
export async function startRelayPairing(
  options: RelayPairingOptions,
): Promise<RelayPairing> {
  const client = new RelayClient(options);
  try {
    await client.connect();
    return client;
  } catch (error) {
    client.close();
    throw asSyncError(error);
  }
}
