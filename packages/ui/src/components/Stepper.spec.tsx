import { describe, expect, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { Stepper } from './Stepper';
describe('Stepper', () => {
  test('increments and decrements within bounds', () => {
    let value = 2;
    const { rerender } = render(<Stepper label="Quantity" value={value} onChange={(v) => (value = v)} />);
    fireEvent.click(screen.getByRole('button', { name: 'Increase Quantity' }));
    expect(value).toBe(3);
    rerender(<Stepper label="Quantity" value={3} onChange={() => {}} max={3} />);
    expect(screen.getByRole('button', { name: 'Increase Quantity' })).toBeDisabled();
  });
});
