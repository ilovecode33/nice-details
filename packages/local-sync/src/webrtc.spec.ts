import { afterEach, describe, expect, test } from '@rstest/core';
import { LocalSyncError } from './errors';
import { createLocalSync } from './webrtc';

const descriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  'RTCPeerConnection',
);

afterEach(() => {
  if (descriptor) {
    Object.defineProperty(globalThis, 'RTCPeerConnection', descriptor);
  } else {
    Reflect.deleteProperty(globalThis, 'RTCPeerConnection');
  }
});

describe('createLocalSync', () => {
  test('fails clearly when WebRTC is unavailable', () => {
    Object.defineProperty(globalThis, 'RTCPeerConnection', {
      value: undefined,
      configurable: true,
    });
    expect(() => createLocalSync({ role: 'host' })).toThrow(LocalSyncError);
  });
});
