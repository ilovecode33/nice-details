import { describe, expect, test } from '@rstest/core';
import { render } from '@testing-library/react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

describe('usePrefersReducedMotion', () => {
  test('returns a boolean', () => {
    let value: unknown;
    function Probe() {
      value = usePrefersReducedMotion();
      return null;
    }
    render(<Probe />);
    expect(typeof value).toBe('boolean');
  });
});
