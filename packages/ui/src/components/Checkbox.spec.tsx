import { describe, expect, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { expectComponentSnapshot } from '../test-utils/snapshot';
import { Checkbox } from './Checkbox';

const snapNoop = () => {};

describe('Checkbox', () => {
  test('syncs aria-checked with the visual state', () => {
    let checked = false;
    const { rerender } = render(<Checkbox checked={checked} onChange={(v) => (checked = v)} label="Private" />);
    const control = screen.getByRole('checkbox', { name: 'Private' });
    expect(control).toHaveAttribute('aria-checked', 'false');
    fireEvent.click(control);
    expect(checked).toBe(true);
    rerender(<Checkbox checked onChange={() => {}} label="Private" />);
    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-checked', 'true');
  });

  test('matches its structural snapshot', () => {
    expectComponentSnapshot(<Checkbox checked label="Private" onChange={snapNoop} />);
  });
});
