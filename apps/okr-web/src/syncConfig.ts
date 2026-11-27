/**
 * Signaling Worker used for one-scan pairing. Override with
 * PUBLIC_SYNC_RELAY_URL when the relay lives on another host.
 */
export const SYNC_RELAY_URL =
  import.meta.env.PUBLIC_SYNC_RELAY_URL ?? 'https://sync.ilovecode33.fyi';

/** Adds server-reflexive candidates while keeping the data channel P2P. */
export const SYNC_ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.cloudflare.com:3478' },
];
