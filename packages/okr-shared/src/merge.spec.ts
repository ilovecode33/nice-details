import { describe, expect, test } from '@rstest/core';
import {
  canonicalJson,
  deleteKeyResult,
  deleteObjective,
  mergeStates,
} from './merge';
import type { KeyResult, Objective, OKRState } from './types';

function objective(
  id: string,
  updatedAt: string,
  overrides: Partial<Objective> = {},
): Objective {
  return {
    id,
    title: `Objective ${id}`,
    note: '',
    period: 'Oct 1 – Dec 31, 2026',
    startDate: '2026-10-01',
    endDate: '2026-12-31',
    keyResults: [],
    createdAt: '2026-10-01T00:00:00.000Z',
    updatedAt,
    ...overrides,
  };
}

function keyResult(
  id: string,
  current: number,
  updatedAt: string,
): KeyResult {
  return {
    id,
    title: `KR ${id}`,
    start: 0,
    target: 100,
    current,
    unit: 'percent',
    weight: 5,
    updatedAt,
  };
}

function state(objectives: Objective[]): OKRState {
  return { version: 1, objectives };
}

describe('mergeStates', () => {
  test('unions objectives and keeps the untouched copy', () => {
    const local = state([objective('a', '2026-11-20T10:00:00.000Z')]);
    const remote = state([objective('b', '2026-11-21T10:00:00.000Z')]);

    const merged = mergeStates(local, remote);
    expect(merged.objectives.map((item) => item.id)).toEqual(['a', 'b']);
  });

  test('newer objective metadata wins while newer key results survive', () => {
    const local = state([
      objective('a', '2026-11-21T10:00:00.000Z', {
        title: 'Newer title',
        keyResults: [keyResult('kr', 10, '2026-11-20T10:00:00.000Z')],
      }),
    ]);
    const remote = state([
      objective('a', '2026-11-20T10:00:00.000Z', {
        title: 'Older title',
        keyResults: [keyResult('kr', 80, '2026-11-22T10:00:00.000Z')],
      }),
    ]);

    const merged = mergeStates(local, remote);
    expect(merged.objectives[0]?.title).toBe('Newer title');
    expect(merged.objectives[0]?.keyResults[0]?.current).toBe(80);
    expect(merged.objectives[0]?.updatedAt).toBe('2026-11-21T10:00:00.000Z');
  });

  test('key results added on either device are kept', () => {
    const local = state([
      objective('a', '2026-11-21T10:00:00.000Z', {
        keyResults: [keyResult('one', 10, '2026-11-21T10:00:00.000Z')],
      }),
    ]);
    const remote = state([
      objective('a', '2026-11-22T10:00:00.000Z', {
        keyResults: [keyResult('two', 20, '2026-11-22T10:00:00.000Z')],
      }),
    ]);

    const merged = mergeStates(local, remote);
    expect(merged.objectives[0]?.keyResults.map((kr) => kr.id)).toEqual([
      'two',
      'one',
    ]);
  });

  test('a deleted objective cannot come back from a stale copy', () => {
    const local = deleteObjective(
      state([objective('a', '2026-11-20T10:00:00.000Z')]),
      'a',
      '2026-11-22T10:00:00.000Z',
    );
    const stale = state([objective('a', '2026-11-20T10:00:00.000Z')]);

    const merged = mergeStates(local, stale);
    expect(merged.objectives).toEqual([]);
    expect(merged.deleted?.objectives?.a).toBe('2026-11-22T10:00:00.000Z');
    expect(mergeStates(stale, local)).toEqual(merged);
  });

  test('a deleted key result cannot come back from a stale copy', () => {
    const original = state([
      objective('a', '2026-11-20T10:00:00.000Z', {
        keyResults: [keyResult('kr', 10, '2026-11-20T10:00:00.000Z')],
      }),
    ]);
    const local = deleteKeyResult(
      original,
      'a',
      'kr',
      '2026-11-22T10:00:00.000Z',
    );

    const merged = mergeStates(local, original);
    expect(merged.objectives[0]?.keyResults).toEqual([]);
    expect(merged.deleted?.keyResults?.['a/kr']).toBe(
      '2026-11-22T10:00:00.000Z',
    );
  });

  test('is commutative and idempotent', () => {
    const local = state([
      objective('a', '2026-11-21T10:00:00.000Z', {
        keyResults: [keyResult('kr', 10, '2026-11-21T10:00:00.000Z')],
      }),
      objective('b', '2026-11-19T10:00:00.000Z'),
    ]);
    const remote = state([
      objective('a', '2026-11-20T10:00:00.000Z', {
        keyResults: [keyResult('kr', 70, '2026-11-22T10:00:00.000Z')],
      }),
      objective('c', '2026-11-23T10:00:00.000Z'),
    ]);

    const forward = mergeStates(local, remote);
    expect(mergeStates(remote, local)).toEqual(forward);
    expect(mergeStates(forward, remote)).toEqual(forward);
    expect(mergeStates(forward, forward)).toEqual(forward);
  });

  test('ignores object key order when timestamps tie', () => {
    const first = objective('a', '2026-11-21T10:00:00.000Z', {
      title: 'Same',
    });
    const second = {
      updatedAt: first.updatedAt,
      createdAt: first.createdAt,
      keyResults: first.keyResults,
      endDate: first.endDate,
      startDate: first.startDate,
      period: first.period,
      note: first.note,
      title: first.title,
      id: first.id,
    } as Objective;

    expect(canonicalJson(mergeStates(state([first]), state([second])))).toBe(
      canonicalJson(mergeStates(state([second]), state([first]))),
    );
  });
});

describe('delete helpers', () => {
  test('deleteObjective removes the objective and records a tombstone', () => {
    const next = deleteObjective(
      state([objective('a', '2026-11-20T10:00:00.000Z')]),
      'a',
      '2026-11-25T10:00:00.000Z',
    );
    expect(next.objectives).toEqual([]);
    expect(next.deleted?.objectives?.a).toBe('2026-11-25T10:00:00.000Z');
  });

  test('deleteKeyResult removes the key result and bumps the objective', () => {
    const next = deleteKeyResult(
      state([
        objective('a', '2026-11-20T10:00:00.000Z', {
          keyResults: [keyResult('kr', 10, '2026-11-20T10:00:00.000Z')],
        }),
      ]),
      'a',
      'kr',
      '2026-11-25T10:00:00.000Z',
    );
    expect(next.objectives[0]?.keyResults).toEqual([]);
    expect(next.objectives[0]?.updatedAt).toBe('2026-11-25T10:00:00.000Z');
    expect(next.deleted?.keyResults?.['a/kr']).toBe('2026-11-25T10:00:00.000Z');
  });
});
