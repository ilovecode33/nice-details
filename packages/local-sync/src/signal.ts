import { base64UrlToBytes, bytesToBase64Url } from './encoding';
import { LocalSyncError } from './errors';
import type { PeerSignal } from './types';

const COMPRESSED_PREFIX = 'ls1:';
const PLAIN_PREFIX = 'ls0:';

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  return buffer;
}

async function gzip(bytes: Uint8Array): Promise<Uint8Array> {
  const stream = new Blob([toArrayBuffer(bytes)]).stream().pipeThrough(
    new CompressionStream('gzip'),
  );
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

async function gunzip(bytes: Uint8Array): Promise<Uint8Array> {
  const stream = new Blob([toArrayBuffer(bytes)]).stream().pipeThrough(
    new DecompressionStream('gzip'),
  );
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

/** Validates a decoded pairing signal. */
export function isPeerSignal(value: unknown): value is PeerSignal {
  if (typeof value !== 'object' || value === null) return false;
  const signal = value as Record<string, unknown>;
  return (
    signal.v === 1 &&
    ((signal.kind === 'offer' && signal.role === 'host') ||
      (signal.kind === 'answer' && signal.role === 'guest')) &&
    typeof signal.session === 'string' &&
    typeof signal.pairingId === 'string' &&
    (signal.kind === 'offer' || typeof signal.guestId === 'string') &&
    typeof signal.label === 'string' &&
    typeof signal.password === 'string' &&
    typeof signal.sdp === 'string' &&
    typeof signal.createdAt === 'number'
  );
}

/**
 * Serializes a signal for a QR code or copy/paste. Uses gzip when the browser
 * supports Compression Streams, otherwise falls back to plain base64url JSON.
 */
export async function encodeSignal(signal: PeerSignal): Promise<string> {
  if (!isPeerSignal(signal)) {
    throw new LocalSyncError('Invalid pairing signal', 'signal');
  }
  const json = JSON.stringify(signal);
  const bytes = new TextEncoder().encode(json);
  if (
    typeof CompressionStream === 'function' &&
    typeof DecompressionStream === 'function'
  ) {
    try {
      return `${COMPRESSED_PREFIX}${bytesToBase64Url(await gzip(bytes))}`;
    } catch {
      /* Fall through to the plain representation. */
    }
  }
  return `${PLAIN_PREFIX}${bytesToBase64Url(bytes)}`;
}

/** Deserializes a QR/paste code and validates the signal shape. */
export async function decodeSignal(code: string): Promise<PeerSignal> {
  const value = code.trim();
  try {
    let json: string;
    if (value.startsWith(COMPRESSED_PREFIX)) {
      if (typeof DecompressionStream !== 'function') {
        throw new Error('Decompression is not available');
      }
      const bytes = base64UrlToBytes(value.slice(COMPRESSED_PREFIX.length));
      json = new TextDecoder().decode(await gunzip(bytes));
    } else if (value.startsWith(PLAIN_PREFIX)) {
      json = new TextDecoder().decode(
        base64UrlToBytes(value.slice(PLAIN_PREFIX.length)),
      );
    } else {
      json = value;
    }
    const parsed: unknown = JSON.parse(json);
    if (!isPeerSignal(parsed)) throw new Error('Invalid signal shape');
    return parsed;
  } catch (error) {
    throw new LocalSyncError('Invalid pairing code', 'signal', {
      cause: error,
    });
  }
}
