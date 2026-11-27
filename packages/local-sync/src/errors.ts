export type LocalSyncErrorCode =
  | 'unsupported'
  | 'webrtc'
  | 'signal'
  | 'storage'
  | 'channel'
  | 'camera'
  | 'permission'
  | 'insecure'
  | 'timeout';

/** Error raised by LocalSync or the QR scanner. */
export class LocalSyncError extends Error {
  readonly code: LocalSyncErrorCode;

  constructor(
    message: string,
    code: LocalSyncErrorCode = 'webrtc',
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = 'LocalSyncError';
    this.code = code;
  }
}
