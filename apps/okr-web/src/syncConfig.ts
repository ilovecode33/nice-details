/**
 * Realtime WebSocket Worker. Override with PUBLIC_SYNC_URL for local or
 * alternate deployments.
 */
export const SYNC_URL =
  import.meta.env.PUBLIC_SYNC_URL ?? 'https://sync.ilovecode33.fyi';
