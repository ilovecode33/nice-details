import { describe, expect, test } from '@rstest/core';
import {
  isAllowedOrigin,
  parseClientMessage,
  parseConnection,
  parseRoom,
} from './protocol';

const room = 'abcdefghijklmnopqrstuvwx';

describe('sync relay protocol', () => {
  test('validates room ids and roles', () => {
    expect(parseRoom(room)).toBe(room);
    expect(parseRoom('short')).toBeNull();
    expect(parseRoom('../bad')).toBeNull();
    expect(
      parseConnection(new URL(`https://relay.test/ws?room=${room}&role=host`)),
    ).toEqual({ room, role: 'host' });
    expect(
      parseConnection(new URL(`https://relay.test/ws?room=${room}&role=other`)),
    ).toBeNull();
  });

  test('allows Cloudflare previews and local development only', () => {
    expect(isAllowedOrigin('https://pr-21.ilovecode33-okr-web.pages.dev')).toBe(
      true,
    );
    expect(isAllowedOrigin('https://okr.ilovecode33.fyi')).toBe(true);
    expect(
      isAllowedOrigin('https://abc123.ilovecode33-okr-web.pages.dev'),
    ).toBe(true);
    expect(isAllowedOrigin('http://localhost:3201')).toBe(true);
    expect(isAllowedOrigin('http://127.0.0.1:3201')).toBe(true);
    expect(isAllowedOrigin('https://example.com')).toBe(false);
    expect(isAllowedOrigin(null)).toBe(false);
  });

  test('accepts only offer, answer, and ping messages', () => {
    expect(parseClientMessage(JSON.stringify({ type: 'ping' }))).toEqual({
      type: 'ping',
    });
    expect(
      parseClientMessage(
        JSON.stringify({ type: 'offer', payload: { sdp: 'v=0' } }),
      ),
    ).toEqual({ type: 'offer', payload: { sdp: 'v=0' } });
    expect(parseClientMessage('not json')).toBeNull();
    expect(parseClientMessage(JSON.stringify({ type: 'state' }))).toBeNull();
    expect(
      parseClientMessage(
        JSON.stringify({ type: 'offer', payload: ['not-an-object'] }),
      ),
    ).toBeNull();
  });
});
