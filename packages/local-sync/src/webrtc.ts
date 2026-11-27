import { randomToken } from './encoding';
import { LocalSyncError } from './errors';
import { openLocalSyncStorage } from './store';
import type {
  LocalSyncIdentity,
  LocalSyncOptions,
  LocalSyncPeer,
  LocalSyncSession,
  LocalSyncState,
  LocalSyncStorage,
  PeerSignal,
} from './types';

const DEFAULT_CHANNEL = 'local-sync';
const ICE_TIMEOUT_MS = 4000;

/** Host or guest session over a WebRTC data channel. */
export class LocalSync implements LocalSyncSession {
  readonly role: 'host' | 'guest';

  private readonly options: LocalSyncOptions;
  private readonly pc: RTCPeerConnection;
  private channel: RTCDataChannel | null = null;
  private currentState: LocalSyncState = 'idle';
  private known = false;
  private offer: PeerSignal | null = null;
  private storePromise: Promise<LocalSyncStorage> | null = null;
  private readonly messageListeners = new Set<(message: string) => void>();
  private readonly stateListeners = new Set<(state: LocalSyncState) => void>();
  private closed = false;

  constructor(options: LocalSyncOptions = {}) {
    if (typeof RTCPeerConnection === 'undefined') {
      throw new LocalSyncError(
        'WebRTC is not available in this environment',
        'unsupported',
      );
    }
    this.role = options.role ?? 'host';
    this.options = options;
    this.pc = new RTCPeerConnection({ iceServers: options.iceServers ?? [] });
    this.pc.onconnectionstatechange = () => {
      const connection = this.pc.connectionState;
      if (connection === 'failed') this.setState('failed');
      else if (connection === 'disconnected') this.setState('disconnected');
      else if (connection === 'closed') this.setState('closed');
      else if (connection === 'connected') this.setState('connected');
    };
    this.pc.ondatachannel = (event) => this.attachChannel(event.channel);
    if (this.role === 'host') {
      this.attachChannel(
        this.pc.createDataChannel(options.channelLabel ?? DEFAULT_CHANNEL, {
          ordered: true,
        }),
      );
    }
  }

  get state(): LocalSyncState {
    return this.currentState;
  }

  get knownPeer(): boolean {
    return this.known;
  }

  async createOffer(): Promise<PeerSignal> {
    this.assertRole('host');
    this.setState('creating-offer');
    const identity = await this.identity('host');
    const store = await this.store();
    if (!identity.password) {
      identity.password = randomToken(18);
      await store.saveIdentity(identity);
    }
    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);
    await this.waitForIce();
    const sdp = this.pc.localDescription?.sdp;
    if (!sdp) {
      throw new LocalSyncError('Could not create a WebRTC offer', 'webrtc');
    }
    const signal: PeerSignal = {
      v: 1,
      kind: 'offer',
      role: 'host',
      session: randomToken(12),
      pairingId: identity.id,
      label: identity.label,
      password: identity.password,
      sdp,
      createdAt: Date.now(),
    };
    this.offer = signal;
    this.setState('awaiting-answer');
    return signal;
  }

  async acceptOffer(signal: PeerSignal): Promise<PeerSignal> {
    this.assertRole('guest');
    if (signal.kind !== 'offer' || signal.role !== 'host') {
      throw new LocalSyncError('Expected a host offer', 'signal');
    }
    this.setState('connecting');
    const identity = await this.identity('guest');
    const store = await this.store();
    const existing = (await store.listPeers()).find(
      (peer) => peer.id === signal.pairingId,
    );
    this.known = Boolean(existing && existing.password === signal.password);

    await this.pc.setRemoteDescription({ type: 'offer', sdp: signal.sdp });
    const answer = await this.pc.createAnswer();
    await this.pc.setLocalDescription(answer);
    await this.waitForIce();
    const sdp = this.pc.localDescription?.sdp;
    if (!sdp) {
      throw new LocalSyncError('Could not create a WebRTC answer', 'webrtc');
    }
    await store.savePeer({
      id: signal.pairingId,
      role: 'host',
      label: signal.label,
      password: signal.password,
      lastSeen: new Date().toISOString(),
    });
    return {
      v: 1,
      kind: 'answer',
      role: 'guest',
      session: signal.session,
      pairingId: signal.pairingId,
      guestId: identity.id,
      label: identity.label,
      password: signal.password,
      sdp,
      createdAt: Date.now(),
    };
  }

  async acceptAnswer(signal: PeerSignal): Promise<void> {
    this.assertRole('host');
    if (signal.kind !== 'answer' || signal.role !== 'guest') {
      throw new LocalSyncError('Expected a guest answer', 'signal');
    }
    if (!signal.guestId) {
      throw new LocalSyncError('The answer is missing a guest id', 'signal');
    }
    if (
      !this.offer ||
      signal.session !== this.offer.session ||
      signal.pairingId !== this.offer.pairingId
    ) {
      throw new LocalSyncError('The answer does not match this offer', 'signal');
    }
    if (signal.password !== this.offer.password) {
      throw new LocalSyncError(
        'The answer password does not match this offer',
        'signal',
      );
    }
    this.setState('connecting');
    const store = await this.store();
    const existing = (await store.listPeers()).find(
      (peer) => peer.id === signal.guestId,
    );
    this.known = Boolean(existing && existing.password === this.offer.password);
    await this.pc.setRemoteDescription({ type: 'answer', sdp: signal.sdp });
    await store.savePeer({
      id: signal.guestId,
      role: 'guest',
      label: signal.label,
      password: this.offer.password,
      lastSeen: new Date().toISOString(),
    });
  }

  send(message: string): void {
    if (this.channel?.readyState !== 'open') {
      throw new LocalSyncError('The data channel is not open', 'channel');
    }
    this.channel.send(message);
  }

  onMessage(listener: (message: string) => void): () => void {
    this.messageListeners.add(listener);
    return () => this.messageListeners.delete(listener);
  }

  onStateChange(listener: (state: LocalSyncState) => void): () => void {
    this.stateListeners.add(listener);
    listener(this.currentState);
    return () => this.stateListeners.delete(listener);
  }

  async listPeers(): Promise<LocalSyncPeer[]> {
    return (await this.store()).listPeers();
  }

  async isKnownPeer(id: string): Promise<boolean> {
    return (await this.listPeers()).some((peer) => peer.id === id);
  }

  async forgetPeer(id: string): Promise<void> {
    await (await this.store()).deletePeer(id);
    this.known = false;
  }

  close(): void {
    if (this.closed) return;
    this.channel?.close();
    this.pc.close();
    this.closed = true;
    this.setState('closed');
    void this.storePromise?.then((store) => store.close()).catch(() => {});
  }

  private attachChannel(channel: RTCDataChannel): void {
    this.channel = channel;
    channel.onopen = () => this.setState('connected');
    channel.onclose = () => this.setState('disconnected');
    channel.onerror = () => this.setState('failed');
    channel.onmessage = (event) => {
      if (typeof event.data !== 'string') return;
      for (const listener of this.messageListeners) listener(event.data);
    };
  }

  private async identity(role: 'host' | 'guest'): Promise<LocalSyncIdentity> {
    const store = await this.store();
    const saved = await store.getIdentity(role);
    if (saved) {
      if (role === 'host' && !saved.password) {
        saved.password = randomToken(18);
        await store.saveIdentity(saved);
      }
      return saved;
    }
    const identity: LocalSyncIdentity = {
      role,
      id: randomToken(16),
      label: this.options.label ?? 'This device',
      ...(role === 'host' ? { password: randomToken(18) } : {}),
      createdAt: new Date().toISOString(),
    };
    await store.saveIdentity(identity);
    return identity;
  }

  private store(): Promise<LocalSyncStorage> {
    this.storePromise ??= (
      this.options.storage
        ? Promise.resolve(this.options.storage)
        : openLocalSyncStorage()
    ).catch((error: unknown) => {
      this.storePromise = null;
      throw new LocalSyncError(
        'Could not open the local-sync store',
        'storage',
        { cause: error },
      );
    });
    return this.storePromise;
  }

  private waitForIce(): Promise<void> {
    if (this.pc.iceGatheringState === 'complete') return Promise.resolve();
    return new Promise((resolve) => {
      let settled = false;
      const onChange = () => {
        if (this.pc.iceGatheringState === 'complete') finish();
      };
      const finish = () => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        this.pc.removeEventListener('icegatheringstatechange', onChange);
        resolve();
      };
      const timer = setTimeout(finish, ICE_TIMEOUT_MS);
      this.pc.addEventListener('icegatheringstatechange', onChange);
    });
  }

  private setState(next: LocalSyncState): void {
    if (this.closed && next !== 'closed') return;
    if (this.currentState === next) return;
    this.currentState = next;
    for (const listener of this.stateListeners) listener(next);
  }

  private assertRole(role: 'host' | 'guest'): void {
    if (this.role !== role) {
      throw new LocalSyncError(`This session is a ${this.role}`, 'webrtc');
    }
  }
}

/** Creates a host or guest session. */
export function createLocalSync(
  options: LocalSyncOptions = {},
): LocalSyncSession {
  return new LocalSync(options);
}
