import { describe, expect, test } from '@rstest/core';
import { normalizeRoomRecord, ROOM_RECORD_VERSION } from './room';

const payload = { iv: 'iv-value', data: 'ciphertext' };

describe('normalizeRoomRecord', () => {
  test('accepts the current record shape', () => {
    const record = normalizeRoomRecord({
      recordVersion: ROOM_RECORD_VERSION,
      payload,
      revision: 3,
      updatedAt: '2026-11-28T00:00:00.000Z',
    });
    expect(record).toEqual({
      recordVersion: 1,
      payload,
      revision: 3,
      updatedAt: '2026-11-28T00:00:00.000Z',
    });
  });

  test('reads records stored before recordVersion existed', () => {
    const record = normalizeRoomRecord({
      payload,
      revision: 1,
      updatedAt: '2026-11-28T00:00:00.000Z',
    });
    expect(record?.recordVersion).toBe(1);
    expect(record?.revision).toBe(1);
  });

  test('ignores a record written by a newer worker version', () => {
    expect(
      normalizeRoomRecord({
        recordVersion: ROOM_RECORD_VERSION + 1,
        payload,
        revision: 1,
        updatedAt: '2026-11-28T00:00:00.000Z',
      }),
    ).toBeNull();
  });

  test('rejects malformed or empty records', () => {
    expect(normalizeRoomRecord(null)).toBeNull();
    expect(normalizeRoomRecord({ payload: {}, revision: 1, updatedAt: 'x' })).toBeNull();
    expect(normalizeRoomRecord({ payload })).toBeNull();
    expect(
      normalizeRoomRecord({ payload, revision: -1, updatedAt: 'x' }),
    ).toBeNull();
  });
});
