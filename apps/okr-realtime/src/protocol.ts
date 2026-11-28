export const MAX_MESSAGE_BYTES = 64 * 1024;

export interface RealtimePeer {
  id: string;
  device: string;
}

export interface EncryptedPayload {
  iv: string;
  data: string;
}

export type RealtimeClientMessage =
  | { type: 'hello'; device: string }
  | { type: 'state'; payload: EncryptedPayload }
  | { type: 'ping' };

export type RealtimeServerMessage =
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
      payload: EncryptedPayload;
      revision: number;
      updatedAt: string;
    }
  | { type: 'ack'; revision: number; updatedAt: string }
  | { type: 'pong' }
  | { type: 'error'; message: string };

const ROOM_PATTERN = /^[A-Za-z0-9_-]{16,64}$/;

const ALLOWED_ORIGINS = [
  /^https:\/\/okr\.ilovecode33\.fyi$/,
  /^https:\/\/ilovecode33-okr-web\.pages\.dev$/,
  /^https:\/\/[a-z0-9-]+\.ilovecode33-okr-web\.pages\.dev$/,
  /^http:\/\/localhost(?::\d+)?$/,
  /^http:\/\/127\.0\.0\.1(?::\d+)?$/,
];

export function parseRoom(value: string | null): string | null {
  return value && ROOM_PATTERN.test(value) ? value : null;
}

export function parseConnection(url: URL): { room: string } | null {
  const room = parseRoom(url.searchParams.get('room'));
  return room ? { room } : null;
}

export function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  return ALLOWED_ORIGINS.some((pattern) => pattern.test(origin));
}

export function parseClientMessage(
  raw: string,
): RealtimeClientMessage | null {
  if (raw.length > MAX_MESSAGE_BYTES) return null;
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof value !== 'object' || value === null) return null;
  const message = value as {
    type?: unknown;
    device?: unknown;
    payload?: unknown;
  };
  if (message.type === 'ping') return { type: 'ping' };
  if (message.type === 'hello') {
    if (typeof message.device !== 'string') return null;
    const device = message.device.trim().slice(0, 64);
    return device ? { type: 'hello', device } : null;
  }
  if (message.type === 'state') {
    const payload = message.payload;
    if (typeof payload !== 'object' || payload === null || Array.isArray(payload)) {
      return null;
    }
    const encrypted = payload as { iv?: unknown; data?: unknown };
    if (
      typeof encrypted.iv !== 'string' ||
      typeof encrypted.data !== 'string'
    ) {
      return null;
    }
    return {
      type: 'state',
      payload: { iv: encrypted.iv, data: encrypted.data },
    };
  }
  return null;
}
