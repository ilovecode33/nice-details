import { describe, expect, test } from '@rstest/core';
import {
  createRoomKey,
  decryptState,
  encryptState,
  importRoomKey,
  isRoomKey,
} from './crypto';

describe('room encryption', () => {
  test('round-trips state with AES-GCM', async () => {
    const key = createRoomKey();
    expect(isRoomKey(key)).toBe(true);
    const cryptoKey = await importRoomKey(key);
    const state = { version: 1, objectives: [{ id: 'one', current: 4 }] };
    const payload = await encryptState(cryptoKey, state);
    expect(payload.data).not.toContain('objectives');
    expect(await decryptState(cryptoKey, payload)).toEqual(state);
  });

  test('rejects a different room key', async () => {
    const first = await importRoomKey(createRoomKey());
    const second = await importRoomKey(createRoomKey());
    const payload = await encryptState(first, { version: 1 });
    await expect(decryptState(second, payload)).rejects.toBeTruthy();
  });
});
