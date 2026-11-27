import { describe, expect, test } from '@rstest/core';
import { LocalSyncError } from './errors';
import { decodeSignal, encodeSignal, isPeerSignal } from './signal';
import type { PeerSignal } from './types';

const offer: PeerSignal = {
  v: 1,
  kind: 'offer',
  role: 'host',
  session: 'session-1',
  pairingId: 'host-1',
  label: 'Desktop',
  password: 'secret',
  sdp: 'v=0\r\no=- 1 1 IN IP4 127.0.0.1\r\n',
  createdAt: 1,
};

const answer: PeerSignal = {
  ...offer,
  kind: 'answer',
  role: 'guest',
  guestId: 'guest-1',
  label: 'Phone',
};

describe('signal', () => {
  test('round-trips offers and answers', async () => {
    for (const signal of [offer, answer]) {
      const code = await encodeSignal(signal);
      expect(code.startsWith('ls0:') || code.startsWith('ls1:')).toBe(true);
      expect(await decodeSignal(code)).toEqual(signal);
    }
  });

  test('accepts raw JSON codes', async () => {
    expect(await decodeSignal(JSON.stringify(offer))).toEqual(offer);
  });

  test('rejects invalid codes', async () => {
    await expect(decodeSignal('not-a-signal')).rejects.toBeInstanceOf(
      LocalSyncError,
    );
    await expect(
      decodeSignal(JSON.stringify({ v: 1 })),
    ).rejects.toBeInstanceOf(LocalSyncError);
  });

  test('validates signal shape', () => {
    expect(isPeerSignal(offer)).toBe(true);
    expect(isPeerSignal(answer)).toBe(true);
    expect(isPeerSignal({ ...offer, kind: 'answer' })).toBe(false);
    expect(isPeerSignal(null)).toBe(false);
  });
});
