export const MAX_RELAY_MESSAGE_BYTES = 64 * 1024;

export type RelayRole = 'host' | 'guest';

export type RelayClientMessage =
  | { type: 'offer'; payload: Record<string, unknown> }
  | { type: 'answer'; payload: Record<string, unknown> }
  | { type: 'ping' };

export type RelayServerMessage =
  | { type: 'ready'; role: RelayRole }
  | { type: 'peer-joined' }
  | { type: 'peer-left' }
  | { type: 'offer'; payload: Record<string, unknown> }
  | { type: 'answer'; payload: Record<string, unknown> }
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

/** Returns a validated room id, or null when it is missing or malformed. */
export function parseRoom(value: string | null): string | null {
  return value && ROOM_PATTERN.test(value) ? value : null;
}

/** Reads the room and role from a `/ws` request URL. */
export function parseConnection(
  url: URL,
): { room: string; role: RelayRole } | null {
  const room = parseRoom(url.searchParams.get('room'));
  const role = url.searchParams.get('role');
  if (!room || (role !== 'host' && role !== 'guest')) return null;
  return { room, role };
}

/** Allows the Pages preview/production origins and local development. */
export function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  return ALLOWED_ORIGINS.some((pattern) => pattern.test(origin));
}

/** Validates a client message without trusting its payload. */
export function parseClientMessage(raw: string): RelayClientMessage | null {
  if (raw.length > MAX_RELAY_MESSAGE_BYTES) return null;
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof value !== 'object' || value === null) return null;
  const message = value as { type?: unknown; payload?: unknown };
  if (message.type === 'ping') return { type: 'ping' };
  if (message.type !== 'offer' && message.type !== 'answer') return null;
  const payload = message.payload;
  if (typeof payload !== 'object' || payload === null || Array.isArray(payload)) {
    return null;
  }
  return { type: message.type, payload: payload as Record<string, unknown> };
}
