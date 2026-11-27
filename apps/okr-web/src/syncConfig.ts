/**
 * Signaling Worker used for one-scan pairing. Override with
 * PUBLIC_SYNC_RELAY_URL when the relay lives on another host.
 */
export const SYNC_RELAY_URL =
  import.meta.env.PUBLIC_SYNC_RELAY_URL ??
  'https://ilovecode33-okr-sync.2y6ddt55g7.workers.dev';

/** Adds server-reflexive candidates while keeping the data channel P2P. */
export const SYNC_ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.cloudflare.com:3478' },
];
