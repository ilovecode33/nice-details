import type { OKRState } from '@ilovecode33/okr-shared';

export type RealtimeStatus =
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'closed'
  | 'failed';

export interface RealtimePeer {
  id: string;
  device: string;
}

export interface RealtimeStateMeta {
  revision: number;
  updatedAt: string | null;
}

export interface RealtimeOptions {
  /** Base URL of the realtime Worker. */
  url: string;
  room: string;
  device: string;
  /** Sent once after the first successful connection (hosts use this). */
  initialState?: OKRState;
  onState?: (state: unknown, meta: RealtimeStateMeta) => void;
  onVersion?: (meta: RealtimeStateMeta) => void;
  onPeers?: (peers: RealtimePeer[]) => void;
  onStatus?: (status: RealtimeStatus) => void;
  /** Injected in tests. */
  socketFactory?: (url: string) => WebSocket;
}

export interface RealtimeSession {
  readonly room: string;
  readonly status: RealtimeStatus;
  sendState(state: OKRState): void;
  close(): void;
}

type ServerMessage =
  | {
      type: 'welcome';
      room: string;
      peers: RealtimePeer[];
      revision: number;
      updatedAt: string | null;
    }
  | { type: 'peers'; peers: RealtimePeer[] }
  | {
      type: 'state';
      state: unknown;
      revision: number;
      updatedAt: string;
    }
  | { type: 'ack'; revision: number; updatedAt: string }
  | { type: 'pong' }
  | { type: 'error'; message: string };

const ROOM_PATTERN = /^[A-Za-z0-9_-]{16,64}$/;
const SOCKET_OPEN = 1;

function randomRoom(): string {
  const bytes = new Uint8Array(18);
  crypto.getRandomValues(bytes);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

/** Creates a URL-safe room id. */
export function createRoomId(): string {
  return randomRoom();
}

/** Builds the link encoded in the host QR. */
export function buildSyncUrl(appUrl: string, room: string): string {
  const url = new URL(appUrl);
  url.hash = `sync=${room}`;
  return url.toString();
}

/** Reads the room from a sync link or a bare room id. */
export function parseSyncLink(value: string): string | null {
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

/** Converts the Worker base URL to its WebSocket endpoint. */
export function syncSocketUrl(baseUrl: string, room: string): string {
  const url = new URL('/ws', baseUrl);
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  url.searchParams.set('room', room);
  return url.toString();
}

function isPeer(value: unknown): value is RealtimePeer {
  if (typeof value !== 'object' || value === null) return false;
  const peer = value as { id?: unknown; device?: unknown };
  return typeof peer.id === 'string' && typeof peer.device === 'string';
}

function parseServerMessage(raw: unknown): ServerMessage | null {
  if (typeof raw !== 'string') return null;
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof value !== 'object' || value === null) return null;
  const message = value as {
    type?: unknown;
    room?: unknown;
    peers?: unknown;
    state?: unknown;
    message?: unknown;
    revision?: unknown;
    updatedAt?: unknown;
  };
  if (message.type === 'pong') return { type: 'pong' };
  if (message.type === 'welcome' || message.type === 'peers') {
    const peers = Array.isArray(message.peers)
      ? message.peers.filter(isPeer)
      : [];
    return message.type === 'welcome'
      ? {
          type: 'welcome',
          room: typeof message.room === 'string' ? message.room : '',
          peers,
          revision:
            typeof message.revision === 'number' ? message.revision : 0,
          updatedAt:
            typeof message.updatedAt === 'string' ? message.updatedAt : null,
        }
      : { type: 'peers', peers };
  }
  if (message.type === 'state') {
    return {
      type: 'state',
      state: message.state,
      revision: typeof message.revision === 'number' ? message.revision : 0,
      updatedAt:
        typeof message.updatedAt === 'string' ? message.updatedAt : '',
    };
  }
  if (message.type === 'ack') {
    return {
      type: 'ack',
      revision: typeof message.revision === 'number' ? message.revision : 0,
      updatedAt:
        typeof message.updatedAt === 'string' ? message.updatedAt : '',
    };
  }
  if (message.type === 'error') {
    return {
      type: 'error',
      message:
        typeof message.message === 'string'
          ? message.message
          : 'Realtime error',
    };
  }
  return null;
}

class RealtimeClient implements RealtimeSession {
  readonly room: string;

  private readonly options: RealtimeOptions;
  private socket: WebSocket | null = null;
  private currentStatus: RealtimeStatus = 'connecting';
  private closed = false;
  private initialSent = false;
  private pendingState: OKRState | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private attempts = 0;

  constructor(options: RealtimeOptions) {
    if (!ROOM_PATTERN.test(options.room)) {
      throw new Error('Invalid sync room');
    }
    this.options = options;
    this.room = options.room;
    this.connect();
  }

  get status(): RealtimeStatus {
    return this.currentStatus;
  }

  sendState(state: OKRState): void {
    this.pendingState = state;
    if (this.socket?.readyState === SOCKET_OPEN) this.flushState();
  }

  close(): void {
    if (this.closed) return;
    this.closed = true;
    this.clearReconnect();
    this.setStatus('closed');
    this.closeSocket();
  }

  private connect(): void {
    if (this.closed) return;
    this.clearReconnect();
    this.setStatus(this.attempts === 0 ? 'connecting' : 'reconnecting');
    const socket = this.options.socketFactory
      ? this.options.socketFactory(syncSocketUrl(this.options.url, this.room))
      : new WebSocket(syncSocketUrl(this.options.url, this.room));
    this.socket = socket;

    socket.addEventListener('open', () => {
      if (this.closed) return;
      this.attempts = 0;
      this.setStatus('connected');
      this.sendRaw({ type: 'hello', device: this.options.device });
      if (this.pendingState) this.flushState();
    });
    socket.addEventListener('message', (event) => {
      const message = parseServerMessage(
        typeof event.data === 'string' ? event.data : null,
      );
      if (!message) return;
      if (message.type === 'welcome' || message.type === 'peers') {
        this.options.onPeers?.(message.peers);
        if (message.type === 'welcome') {
          this.options.onVersion?.({
            revision: message.revision,
            updatedAt: message.updatedAt,
          });
          if (
            !this.initialSent &&
            this.options.initialState &&
            message.revision === 0
          ) {
            this.initialSent = true;
            this.sendRaw({
              type: 'state',
              state: this.options.initialState,
            });
          }
        }
      } else if (message.type === 'state') {
        this.options.onState?.(message.state, {
          revision: message.revision,
          updatedAt: message.updatedAt,
        });
        this.options.onVersion?.({
          revision: message.revision,
          updatedAt: message.updatedAt,
        });
      } else if (message.type === 'ack') {
        this.options.onVersion?.({
          revision: message.revision,
          updatedAt: message.updatedAt,
        });
      }
    });
    socket.addEventListener('close', () => this.scheduleReconnect(socket));
    socket.addEventListener('error', () => this.scheduleReconnect(socket));
  }

  private flushState(): void {
    if (!this.pendingState || this.socket?.readyState !== SOCKET_OPEN) return;
    const state = this.pendingState;
    this.pendingState = null;
    this.initialSent = true;
    this.sendRaw({ type: 'state', state });
  }

  private sendRaw(message: unknown): void {
    if (this.socket?.readyState !== SOCKET_OPEN) return;
    this.socket.send(JSON.stringify(message));
  }

  private scheduleReconnect(socket: WebSocket): void {
    if (this.closed || this.socket !== socket) return;
    this.socket = null;
    try {
      socket.close();
    } catch {
      /* Already closed. */
    }
    this.attempts += 1;
    const delay = Math.min(1000 * 2 ** (this.attempts - 1), 10_000);
    this.setStatus('reconnecting');
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }

  private clearReconnect(): void {
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
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

  private setStatus(next: RealtimeStatus): void {
    if (this.currentStatus === next) return;
    this.currentStatus = next;
    this.options.onStatus?.(next);
  }
}

/** Opens a realtime room; reconnects automatically until closed. */
export function createRealtimeSession(
  options: RealtimeOptions,
): RealtimeSession {
  return new RealtimeClient(options);
}

export type { OKRState };
