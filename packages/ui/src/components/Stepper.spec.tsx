import { describe, expect, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { expectComponentSnapshot } from '../test-utils/snapshot';
import { Stepper } from './Stepper';

const snapNoop = () => {};

describe('Stepper', () => {
  test('increments and decrements within bounds', () => {
    let value = 2;
    const { rerender } = render(<Stepper label="Quantity" value={value} onChange={(v) => (value = v)} />);
    fireEvent.click(screen.getByRole('button', { name: 'Increase Quantity' }));
    expect(value).toBe(3);
    rerender(<Stepper label="Quantity" value={3} onChange={() => {}} max={3} />);
    expect(screen.getByRole('button', { name: 'Increase Quantity' })).toBeDisabled();
  });

  test('matches its structural snapshot', () => {
    expectComponentSnapshot(<Stepper label="Quantity" value={3} onChange={snapNoop} />);
  });
});
