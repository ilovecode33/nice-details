/** Stable local identity for a host or guest. */
export interface LocalSyncIdentity {
  role: 'host' | 'guest';
  id: string;
  label: string;
  /** Host-only shared pairing password. */
  password?: string;
  createdAt: string;
}

/** A remembered peer. */
export interface LocalSyncPeer {
  /** Host pairing ID for a host peer, or guest ID for a guest peer. */
  id: string;
  role: 'host' | 'guest';
  label: string;
  password: string;
  lastSeen: string;
}

/** Storage adapter used by LocalSync. */
export interface LocalSyncStorage {
  getIdentity(role: 'host' | 'guest'): Promise<LocalSyncIdentity | undefined>;
  saveIdentity(identity: LocalSyncIdentity): Promise<void>;
  listPeers(): Promise<LocalSyncPeer[]>;
  savePeer(peer: LocalSyncPeer): Promise<void>;
  deletePeer(id: string): Promise<void>;
  close(): void;
}

/** Pairing payload encoded in a QR code or pasted as a code. */
export interface PeerSignal {
  v: 1;
  kind: 'offer' | 'answer';
  role: 'host' | 'guest';
  /** Per-connection random ID. */
  session: string;
  /** Host's stable identity ID. */
  pairingId: string;
  /** Guest's stable identity ID (answer only). */
  guestId?: string;
  /** Human-readable device label. */
  label: string;
  /** Shared pairing password included in the offer. */
  password: string;
  /** Full SDP including gathered ICE candidates. */
  sdp: string;
  createdAt: number;
}

export type LocalSyncState =
  | 'idle'
  | 'creating-offer'
  | 'awaiting-answer'
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'failed'
  | 'closed';

export interface LocalSyncOptions {
  role?: 'host' | 'guest';
  label?: string;
  iceServers?: RTCIceServer[];
  channelLabel?: string;
  /** Inject a storage adapter for tests or a custom trust store. */
  storage?: LocalSyncStorage;
}

export interface LocalSyncSession {
  readonly role: 'host' | 'guest';
  readonly state: LocalSyncState;
  /** True when the accepted peer matched a stored pairing password. */
  readonly knownPeer: boolean;
  createOffer(): Promise<PeerSignal>;
  acceptOffer(signal: PeerSignal): Promise<PeerSignal>;
  acceptAnswer(signal: PeerSignal): Promise<void>;
  send(message: string): void;
  onMessage(listener: (message: string) => void): () => void;
  onStateChange(listener: (state: LocalSyncState) => void): () => void;
  listPeers(): Promise<LocalSyncPeer[]>;
  isKnownPeer(id: string): Promise<boolean>;
  forgetPeer(id: string): Promise<void>;
  close(): void;
}
