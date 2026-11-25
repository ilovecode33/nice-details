import { describe, expect, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { PressGlow } from './PressGlow';
describe('PressGlow', () => {
  test('stays hidden from assistive technology', () => {
    const { container } = render(<PressGlow pulse={1} />);
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
  });
});
