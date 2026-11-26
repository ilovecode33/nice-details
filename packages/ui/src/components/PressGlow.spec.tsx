import { describe, expect, test } from '@rstest/core';
import { render } from '@testing-library/react';
import { PressGlow } from './PressGlow';
import { expectComponentSnapshot } from '../test-utils/snapshot';

describe('PressGlow', () => {
  test('stays hidden from assistive technology', () => {
    const { container } = render(<PressGlow pulse={1} />);
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
  });

  test('matches its structural snapshot', () => {
    expectComponentSnapshot(<PressGlow pulse={1} />);
  });
});
