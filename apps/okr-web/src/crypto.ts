/**
 * End-to-end encryption for realtime OKR state. The room key travels only in
 * the URL fragment, so the Cloudflare Worker stores and relays ciphertext.
 */

export const ROOM_KEY_BYTES = 32;
export const ROOM_KEY_PATTERN = /^[A-Za-z0-9_-]{43}$/;

export interface EncryptedPayload {
  iv: string;
  data: string;
}

export function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

export function base64UrlToBytes(value: string): Uint8Array {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(
    base64.length + ((4 - (base64.length % 4)) % 4),
    '=',
  );
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

/** Creates a 256-bit AES-GCM room key. */
export function createRoomKey(): string {
  const bytes = new Uint8Array(ROOM_KEY_BYTES);
  crypto.getRandomValues(bytes);
  return bytesToBase64Url(bytes);
}

export function isRoomKey(value: string): boolean {
  return ROOM_KEY_PATTERN.test(value) && base64UrlToBytes(value).length === ROOM_KEY_BYTES;
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  return buffer;
}

export async function importRoomKey(key: string): Promise<CryptoKey> {
  if (typeof crypto === 'undefined' || !crypto.subtle) {
    throw new Error('Web Crypto is not available in this browser');
  }
  if (!isRoomKey(key)) throw new Error('Invalid room key');
  return crypto.subtle.importKey(
    'raw',
    toArrayBuffer(base64UrlToBytes(key)),
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt'],
  );
}

export async function encryptState(
  key: CryptoKey,
  state: unknown,
): Promise<EncryptedPayload> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: toArrayBuffer(iv) },
    key,
    toArrayBuffer(new TextEncoder().encode(JSON.stringify(state))),
  );
  return {
    iv: bytesToBase64Url(iv),
    data: bytesToBase64Url(new Uint8Array(data)),
  };
}

export async function decryptState(
  key: CryptoKey,
  payload: EncryptedPayload,
): Promise<unknown> {
  const data = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: toArrayBuffer(base64UrlToBytes(payload.iv)),
    },
    key,
    toArrayBuffer(base64UrlToBytes(payload.data)),
  );
  return JSON.parse(new TextDecoder().decode(data));
}

export function isEncryptedPayload(value: unknown): value is EncryptedPayload {
  if (typeof value !== 'object' || value === null) return false;
  const payload = value as { iv?: unknown; data?: unknown };
  return typeof payload.iv === 'string' && typeof payload.data === 'string';
}
