import {
  MAX_MESSAGE_BYTES,
  parseClientMessage,
  parseConnection,
  type EncryptedPayload,
  type RealtimePeer,
} from './protocol';

const ROOM_TTL_MS = 24 * 60 * 60 * 1000;
/** Version of the stored room record. Bump with a reader change when it changes. */
export const ROOM_RECORD_VERSION = 1;

interface SocketAttachment {
  id: string;
  device: string;
}

interface RoomRecord {
  recordVersion: number;
  payload: EncryptedPayload;
  revision: number;
  updatedAt: string;
}

/**
 * Reads a stored room record, including records written before
 * `recordVersion` existed. Unknown future versions are ignored instead of
 * being served with the wrong shape.
 */
export function normalizeRoomRecord(value: unknown): RoomRecord | null {
  if (typeof value !== 'object' || value === null) return null;
  const record = value as {
    recordVersion?: unknown;
    payload?: unknown;
    revision?: unknown;
    updatedAt?: unknown;
  };
  const recordVersion =
    record.recordVersion === undefined ? 1 : record.recordVersion;
  if (
    typeof recordVersion !== 'number' ||
    !Number.isInteger(recordVersion) ||
    recordVersion < 1 ||
    recordVersion > ROOM_RECORD_VERSION
  ) {
    return null;
  }
  const payload = record.payload as { iv?: unknown; data?: unknown } | null;
  if (
    typeof payload !== 'object' ||
    payload === null ||
    typeof payload.iv !== 'string' ||
    typeof payload.data !== 'string'
  ) {
    return null;
  }
  const revision = record.revision;
  if (
    typeof revision !== 'number' ||
    !Number.isFinite(revision) ||
    revision < 0
  ) {
    return null;
  }
  if (typeof record.updatedAt !== 'string') return null;
  return {
    recordVersion,
    payload: { iv: payload.iv, data: payload.data },
    revision,
    updatedAt: record.updatedAt,
  };
}

async function loadRoom(
  storage: DurableObjectStorage,
): Promise<
  { status: 'ok'; record: RoomRecord | null } | { status: 'unreadable' }
> {
  const raw = await storage.get<unknown>('room');
  if (raw === undefined) return { status: 'ok', record: null };
  const record = normalizeRoomRecord(raw);
  // A record exists but this worker cannot read it. Serving "empty" would let
  // the next update overwrite data written by a newer release.
  return record ? { status: 'ok', record } : { status: 'unreadable' };
}

function send(socket: WebSocket, message: unknown): void {
  try {
    socket.send(JSON.stringify(message));
  } catch {
    /* The close handler cleans up. */
  }
}

/**
 * One Durable Object per room. It stores the latest OKR state and broadcasts
 * changes immediately to every other connected device.
 */
export class SyncRoom {
  private readonly state: DurableObjectState;

  constructor(state: DurableObjectState) {
    this.state = state;
  }

  async fetch(request: Request): Promise<Response> {
    const connection = parseConnection(new URL(request.url));
    if (!connection) {
      return new Response('Invalid room', { status: 400 });
    }

    const room = await loadRoom(this.state.storage);
    if (room.status === 'unreadable') {
      return new Response('Room data needs a newer worker', { status: 503 });
    }
    const stored = room.record;

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    this.state.acceptWebSocket(server);
    server.serializeAttachment({
      id: crypto.randomUUID(),
      device: 'Device',
    } satisfies SocketAttachment);

    send(server, {
      type: 'welcome',
      room: connection.room,
      peers: this.peers(),
      revision: stored?.revision ?? 0,
      updatedAt: stored?.updatedAt ?? null,
    });
    if (stored) {
      send(server, {
        type: 'state',
        payload: stored.payload,
        revision: stored.revision,
        updatedAt: stored.updatedAt,
      });
    }
    await this.state.storage.deleteAlarm();

    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(
    socket: WebSocket,
    message: string | ArrayBuffer,
  ): Promise<void> {
    if (typeof message !== 'string') {
      socket.close(1003, 'Text messages only');
      return;
    }
    if (message.length > MAX_MESSAGE_BYTES) {
      socket.close(1009, 'Message too large');
      return;
    }
    const parsed = parseClientMessage(message);
    if (!parsed) {
      socket.close(1008, 'Invalid message');
      return;
    }
    const attachment = socket.deserializeAttachment() as SocketAttachment | null;
    if (!attachment) {
      socket.close(1008, 'Missing socket state');
      return;
    }

    if (parsed.type === 'ping') {
      send(socket, { type: 'pong' });
      return;
    }
    if (parsed.type === 'hello') {
      socket.serializeAttachment({
        ...attachment,
        device: parsed.device,
      } satisfies SocketAttachment);
      this.broadcastPeers();
      return;
    }

    const room = await loadRoom(this.state.storage);
    if (room.status === 'unreadable') {
      socket.close(1011, 'Room data needs a newer worker');
      return;
    }
    const current = room.record;
    const revision = (current?.revision ?? 0) + 1;
    const updatedAt = new Date().toISOString();
    const record: RoomRecord = {
      recordVersion: ROOM_RECORD_VERSION,
      payload: parsed.payload,
      revision,
      updatedAt,
    };
    await this.state.storage.put('room', record);
    send(socket, { type: 'ack', revision, updatedAt });
    for (const target of this.state.getWebSockets()) {
      if (target !== socket) {
        send(target, {
          type: 'state',
          payload: record.payload,
          revision,
          updatedAt,
        });
      }
    }
  }

  async webSocketClose(): Promise<void> {
    this.broadcastPeers();
    if (this.state.getWebSockets().length === 0) {
      await this.state.storage.setAlarm(Date.now() + ROOM_TTL_MS);
    }
  }

  async webSocketError(socket: WebSocket): Promise<void> {
    try {
      socket.close(1011, 'Realtime socket error');
    } catch {
      /* Already closed. */
    }
  }

  async alarm(): Promise<void> {
    await this.state.storage.deleteAll();
  }

  private peers(): RealtimePeer[] {
    return this.state
      .getWebSockets()
      .map((socket) => socket.deserializeAttachment() as SocketAttachment | null)
      .filter((attachment): attachment is SocketAttachment => Boolean(attachment))
      .map((attachment) => ({
        id: attachment.id,
        device: attachment.device,
      }));
  }

  private broadcastPeers(): void {
    const peers = this.peers();
    for (const socket of this.state.getWebSockets()) {
      send(socket, { type: 'peers', peers });
    }
  }
}
