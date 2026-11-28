import { describe, expect, test } from '@rstest/core';
import { normalizeState } from './normalize';
import { createSampleState } from './sample';
import type { StoredOKRState } from './types';

describe('normalizeState', () => {
  test('keeps valid deletion tombstones', () => {
    const state: StoredOKRState = {
      ...createSampleState(),
      deleted: {
        objectives: { gone: '2026-11-01T00:00:00.000Z' },
        keyResults: { 'kept/kr': '2026-11-02T00:00:00.000Z' },
      },
    };

    const normalized = normalizeState(state);
    expect(normalized.deleted).toEqual({
      objectives: { gone: '2026-11-01T00:00:00.000Z' },
      keyResults: { 'kept/kr': '2026-11-02T00:00:00.000Z' },
    });
    expect(normalized.objectives).toHaveLength(3);
  });

  test('drops malformed tombstones instead of failing the load', () => {
    const state = {
      ...createSampleState(),
      deleted: { objectives: { gone: 42 }, keyResults: 'nope' },
    } as unknown as StoredOKRState;

    expect(normalizeState(state).deleted).toBeUndefined();
  });
});
