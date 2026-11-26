import { describe, expect, test } from '@rstest/core';
import { render } from '@testing-library/react';
import { Skeleton } from './Skeleton';
import { expectComponentSnapshot } from '../test-utils/snapshot';

describe('Skeleton', () => {
  test('is hidden from assistive technology', () => {
    const { container } = render(<Skeleton />);
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
  });

  test('matches its structural snapshot', () => {
    expectComponentSnapshot(<Skeleton />);
  });
});
