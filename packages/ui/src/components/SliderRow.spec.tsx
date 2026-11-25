import { describe, expect, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { SliderRow } from './SliderRow';
describe('SliderRow', () => {
  test('formats the value and reports changes', () => {
    let next = -1;
    render(<SliderRow label="Volume" min={0} max={10} step={1} value={5} fmt={(v) => `${v}%`} onChange={(v) => (next = v)} />);
    expect(screen.getByText('5%')).toBeInTheDocument();
    fireEvent.change(screen.getByRole('slider', { name: 'Volume' }), { target: { value: '7' } });
    expect(next).toBe(7);
  });
});
