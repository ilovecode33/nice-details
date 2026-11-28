import { describe, expect, test } from '@rstest/core';
import {
  isAllowedOrigin,
  parseClientMessage,
  parseConnection,
  parseRoom,
} from './protocol';

const room = 'abcdefghijklmnopqrstuvwx';

describe('okr realtime protocol', () => {
  test('validates rooms and origins', () => {
    expect(parseRoom(room)).toBe(room);
    expect(parseRoom('short')).toBeNull();
    expect(
      parseConnection(new URL(`https://relay.test/ws?room=${room}`)),
    ).toEqual({ room });
    expect(isAllowedOrigin('https://okr.ilovecode33.fyi')).toBe(true);
    expect(isAllowedOrigin('https://pr-21.ilovecode33-okr-web.pages.dev')).toBe(
      true,
    );
    expect(isAllowedOrigin('http://localhost:3201')).toBe(true);
    expect(isAllowedOrigin('https://example.com')).toBe(false);
  });

  test('accepts hello, state, and ping messages', () => {
    expect(
      parseClientMessage(JSON.stringify({ type: 'hello', device: 'Mac' })),
    ).toEqual({ type: 'hello', device: 'Mac' });
    expect(
      parseClientMessage(
        JSON.stringify({ type: 'state', state: { version: 1 } }),
      ),
    ).toEqual({ type: 'state', state: { version: 1 } });
    expect(parseClientMessage(JSON.stringify({ type: 'ping' }))).toEqual({
      type: 'ping',
    });
    expect(parseClientMessage(JSON.stringify({ type: 'state' }))).toBeNull();
    expect(parseClientMessage('not json')).toBeNull();
  });
});
