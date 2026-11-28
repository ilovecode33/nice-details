import { describe, expect, test } from '@rstest/core';
import { parseState } from './schema';
import { createSampleState } from './sample';

describe('parseState', () => {
  test('accepts the current version and normalizes legacy dates', () => {
    const sample = createSampleState();
    const legacy = {
      version: 1,
      objectives: [
        {
          ...sample.objectives[0],
          startDate: undefined,
          endDate: undefined,
          period: '2026 Q4',
          extra: 'kept',
        },
      ],
    };

    const result = parseState(legacy);
    expect(result.status).toBe('ok');
    if (result.status !== 'ok') return;
    expect(result.migrated).toBe(false);
    expect(result.state.objectives[0]?.startDate).toBe('2026-10-01');
    expect(result.state.objectives[0]?.endDate).toBe('2026-12-31');
    expect(result.state.objectives[0]?.period).toBe('Oct 1 – Dec 31, 2026');
    // Unknown fields survive so a newer app can read them back.
    expect(
      (result.state.objectives[0] as unknown as Record<string, unknown>).extra,
    ).toBe('kept');
  });

  test('rejects values that are not a document', () => {
    expect(parseState(null).status).toBe('invalid');
    expect(parseState({ objectives: [] }).status).toBe('invalid');
    expect(parseState({ version: 'one', objectives: [] }).status).toBe(
      'invalid',
    );
  });

  test('rejects malformed objectives instead of dropping them', () => {
    const result = parseState({
      version: 1,
      objectives: [{ id: 'x', title: 'Missing fields' }],
    });
    expect(result.status).toBe('invalid');
    if (result.status !== 'invalid') return;
    expect(result.reason).toContain('Objective 0');
  });

  test('reports a newer version without rewriting it', () => {
    const result = parseState({ version: 2, objectives: [] });
    expect(result).toEqual({ status: 'newer', version: 2 });
  });
});
