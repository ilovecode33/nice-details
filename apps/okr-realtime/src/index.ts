import { isAllowedOrigin, parseConnection } from './protocol';
import { SyncRoom } from './room';

export { SyncRoom };

export interface Env {
  SYNC_ROOM: DurableObjectNamespace;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }
    if (url.pathname === '/health') {
      return Response.json({ ok: true }, { headers: CORS_HEADERS });
    }
    if (url.pathname !== '/ws') {
      return new Response('Not found', { status: 404 });
    }
    if (request.headers.get('Upgrade')?.toLowerCase() !== 'websocket') {
      return new Response('Expected a WebSocket upgrade', { status: 426 });
    }
    if (!isAllowedOrigin(request.headers.get('Origin'))) {
      return new Response('Origin not allowed', { status: 403 });
    }
    const connection = parseConnection(url);
    if (!connection) {
      return new Response('Invalid room', { status: 400 });
    }

    const id = env.SYNC_ROOM.idFromName(connection.room);
    return env.SYNC_ROOM.get(id).fetch(request);
  },
} satisfies ExportedHandler<Env>;
