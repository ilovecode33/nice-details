import { describe, expect, test } from '@rstest/core';
import {
  buildSyncUrl,
  createRoomId,
  parseSyncLink,
  syncSocketUrl,
} from './realtime';

describe('realtime helpers', () => {
  test('creates URL-safe room ids', () => {
    const room = createRoomId();
    expect(room).toMatch(/^[A-Za-z0-9_-]{16,64}$/);
    expect(createRoomId()).not.toBe(room);
  });

  test('builds and parses room links', () => {
    expect(buildSyncUrl('https://app.example/okr', 'abcdefghijklmnop')).toBe(
      'https://app.example/okr#sync=abcdefghijklmnop',
    );
    expect(
      parseSyncLink('https://app.example/okr#sync=abcdefghijklmnop'),
    ).toBe('abcdefghijklmnop');
    expect(
      parseSyncLink('https://app.example/okr?sync=abcdefghijklmnop'),
    ).toBe('abcdefghijklmnop');
    expect(parseSyncLink('abcdefghijklmnop')).toBe('abcdefghijklmnop');
    expect(parseSyncLink('https://app.example/okr')).toBeNull();
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
