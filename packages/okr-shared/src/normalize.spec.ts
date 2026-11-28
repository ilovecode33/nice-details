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

  test('trims a shared profile and keeps a cleared name', () => {
    const named = normalizeState({
      ...createSampleState(),
      profile: { name: '  Ada  ', updatedAt: '2026-11-28T00:00:00.000Z' },
    });
    expect(named.profile).toEqual({
      name: 'Ada',
      updatedAt: '2026-11-28T00:00:00.000Z',
    });

    const cleared = normalizeState({
      ...createSampleState(),
      profile: { name: '   ', updatedAt: '2026-11-28T00:00:00.000Z' },
    });
    expect(cleared.profile).toEqual({
      name: '',
      updatedAt: '2026-11-28T00:00:00.000Z',
    });
  });

  test('drops a profile that is not a name and timestamp', () => {
    const state = {
      ...createSampleState(),
      profile: { name: 1 },
    } as unknown as StoredOKRState;

    expect(normalizeState(state).profile).toBeUndefined();
  });

  test('drops malformed tombstones instead of failing the load', () => {
    const state = {
      ...createSampleState(),
      deleted: { objectives: { gone: 42 }, keyResults: 'nope' },
    } as unknown as StoredOKRState;

    expect(normalizeState(state).deleted).toBeUndefined();
  });
});
