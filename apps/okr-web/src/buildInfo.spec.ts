import { describe, expect, test } from '@rstest/core';
import { formatBuildTime } from './buildInfo';

describe('formatBuildTime', () => {
  test('formats an injected ISO timestamp', () => {
    const formatted = formatBuildTime('2026-11-28T06:33:00.000Z', 'en-US');
    expect(formatted).toContain('2026');
    expect(formatted).toContain('Nov');
  });

  test('returns null when the build did not inject a time', () => {
    expect(formatBuildTime(undefined, 'en-US')).toBeNull();
    expect(formatBuildTime('not a date', 'en-US')).toBeNull();
  });
});
