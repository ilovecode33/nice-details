import {
  MAX_MESSAGE_BYTES,
  parseClientMessage,
  parseConnection,
  type EncryptedPayload,
  type RealtimePeer,
} from './protocol';

const ROOM_TTL_MS = 24 * 60 * 60 * 1000;

interface SocketAttachment {
  id: string;
  device: string;
}

interface RoomRecord {
  payload: EncryptedPayload;
  revision: number;
  updatedAt: string;
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

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    this.state.acceptWebSocket(server);
    server.serializeAttachment({
      id: crypto.randomUUID(),
      device: 'Device',
    } satisfies SocketAttachment);

    const stored = await this.state.storage.get<RoomRecord>('room');
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

    const current = await this.state.storage.get<RoomRecord>('room');
    const revision = (current?.revision ?? 0) + 1;
    const updatedAt = new Date().toISOString();
    const record: RoomRecord = {
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
