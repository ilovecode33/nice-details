import { describe, expect, test } from '@rstest/core';
import { randomDeviceName } from './deviceName';

describe('randomDeviceName', () => {
  test('builds a friendly two-word name', () => {
    const name = randomDeviceName();
    expect(name).toMatch(/^[A-Z][a-z]+ [A-Z][a-z]+$/);
    expect(name).not.toContain('·');
    expect(name).not.toMatch(/Mac|Chrome|iPhone|Safari/);
  });
});
