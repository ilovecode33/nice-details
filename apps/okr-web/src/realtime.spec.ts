import { describe, expect, test } from '@rstest/core';
import {
  buildSyncUrl,
  createRoomId,
  parseSyncLink,
  syncSocketUrl,
} from './realtime';

const room = 'abcdefghijklmnop';
const key = 'A'.repeat(43);

describe('realtime helpers', () => {
  test('creates URL-safe room ids', () => {
    const id = createRoomId();
    expect(id).toMatch(/^[A-Za-z0-9_-]{16,64}$/);
    expect(createRoomId()).not.toBe(id);
  });

  test('builds and parses room links with the key in the fragment', () => {
    const link = buildSyncUrl('https://app.example/okr', room, key);
    expect(link).toContain(`#sync=${room}&key=${key}`);
    expect(parseSyncLink(link)).toEqual({ room, key });
    expect(parseSyncLink('https://app.example/okr')).toBeNull();
    expect(
      parseSyncLink(`https://app.example/okr#sync=${room}`),
    ).toBeNull();
    expect(
      parseSyncLink(`https://app.example/okr?sync=${room}&key=${key}`),
    ).toEqual({ room, key });
  });

  test('builds secure WebSocket endpoints', () => {
    expect(syncSocketUrl('https://sync.example', 'room')).toBe(
      'wss://sync.example/ws?room=room',
    );
    expect(syncSocketUrl('http://localhost:8787', 'room')).toBe(
      'ws://localhost:8787/ws?room=room',
    );
  });
});
