import {
  MAX_RELAY_MESSAGE_BYTES,
  parseClientMessage,
  parseConnection,
  type RelayRole,
} from './protocol';

const ROOM_TTL_MS = 10 * 60 * 1000;

interface SocketAttachment {
  role: RelayRole;
}

function send(socket: WebSocket, message: unknown): void {
  try {
    socket.send(JSON.stringify(message));
  } catch {
    /* The socket may already be closed; the close handler cleans up. */
  }
}

/**
 * One Durable Object per pairing room. It only relays the WebRTC offer/answer
 * and never sees OKR state, which travels over the peer-to-peer data channel.
 */
export class PairRoom {
  private readonly state: DurableObjectState;

  constructor(state: DurableObjectState) {
    this.state = state;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const connection = parseConnection(url);
    if (!connection) {
      return new Response('Invalid room or role', { status: 400 });
    }
    const { role } = connection;

    if (role === 'guest' && this.state.getWebSockets('host').length === 0) {
      return new Response('Host is offline or the pairing link expired', {
        status: 409,
      });
    }

    // A reconnecting peer replaces its previous socket. The room id is the
    // shared secret, so this never widens access beyond the QR holder.
    for (const socket of this.state.getWebSockets(role)) {
      try {
        socket.close(4000, 'Replaced by a newer connection');
      } catch {
        /* Already closed. */
      }
    }

    if (role === 'host') {
      await this.state.storage.delete('offer');
      await this.state.storage.delete('answer');
    } else {
      await this.state.storage.delete('answer');
    }

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    this.state.acceptWebSocket(server, [role]);
    server.serializeAttachment({ role } satisfies SocketAttachment);
    send(server, { type: 'ready', role });

    if (role === 'guest') {
      const offer = await this.state.storage.get('offer');
      if (offer) send(server, { type: 'offer', payload: offer });
      for (const host of this.state.getWebSockets('host')) {
        send(host, { type: 'peer-joined' });
      }
    } else {
      if (this.state.getWebSockets('guest').length > 0) {
        send(server, { type: 'peer-joined' });
      }
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
    if (message.length > MAX_RELAY_MESSAGE_BYTES) {
      socket.close(1009, 'Message too large');
      return;
    }

    const attachment = socket.deserializeAttachment() as SocketAttachment | null;
    if (!attachment) {
      socket.close(1008, 'Missing role');
      return;
    }

    const parsed = parseClientMessage(message);
    if (!parsed) {
      socket.close(1008, 'Invalid message');
      return;
    }
    const targetRole: RelayRole =
      attachment.role === 'host' ? 'guest' : 'host';
    if (parsed.type === 'app') {
      for (const target of this.state.getWebSockets(targetRole)) {
        send(target, parsed);
      }
      return;
    }
    if (parsed.type === 'ping') {
      send(socket, { type: 'pong' });
      return;
    }
    if (parsed.type === 'offer' && attachment.role !== 'host') {
      socket.close(1008, 'Only the host can send an offer');
      return;
    }
    if (parsed.type === 'answer' && attachment.role !== 'guest') {
      socket.close(1008, 'Only the guest can send an answer');
      return;
    }

    await this.state.storage.put(parsed.type, parsed.payload);
    for (const target of this.state.getWebSockets(targetRole)) {
      send(target, parsed);
    }
  }

  async webSocketClose(socket: WebSocket): Promise<void> {
    const attachment = socket.deserializeAttachment() as SocketAttachment | null;
    if (!attachment) return;
    const otherRole: RelayRole =
      attachment.role === 'host' ? 'guest' : 'host';

    if (attachment.role === 'host') {
      await this.state.storage.delete('offer');
      await this.state.storage.delete('answer');
    } else {
      await this.state.storage.delete('answer');
    }

    for (const other of this.state.getWebSockets(otherRole)) {
      send(other, { type: 'peer-left' });
    }

    if (
      this.state.getWebSockets('host').length === 0 &&
      this.state.getWebSockets('guest').length === 0
    ) {
      await this.state.storage.setAlarm(Date.now() + ROOM_TTL_MS);
    }
  }

  async webSocketError(socket: WebSocket): Promise<void> {
    try {
      socket.close(1011, 'Relay socket error');
    } catch {
      /* Already closed. */
    }
  }

  async alarm(): Promise<void> {
    await this.state.storage.deleteAll();
  }
}
