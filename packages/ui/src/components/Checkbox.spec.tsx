import { describe, expect, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { Checkbox } from './Checkbox';
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
});
