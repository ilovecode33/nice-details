import { describe, expect, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { RadioGroup } from './RadioGroup';
import { expectComponentSnapshot } from '../test-utils/snapshot';

const snapNoop = () => {};
const snapSegments = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
];

describe('RadioGroup', () => {
  test('marks the active option and reports changes', () => {
    let value = 'day';
    const options = [{ value: 'day', label: 'Day' }, { value: 'week', label: 'Week' }];
    const { rerender } = render(<RadioGroup label="Range" options={options} value={value} onChange={(v) => (value = v)} />);
    const group = screen.getByRole('radiogroup', { name: 'Range' });
    expect(group).toBeInTheDocument();
    fireEvent.click(screen.getByRole('radio', { name: 'Week' }));
    expect(value).toBe('week');
    rerender(<RadioGroup label="Range" options={options} value="week" onChange={() => {}} />);
    expect(screen.getByRole('radio', { name: 'Week' })).toHaveAttribute('aria-checked', 'true');
  });

  test('matches its structural snapshot', () => {
    expectComponentSnapshot(
      <RadioGroup label="Range" options={snapSegments} value="day" onChange={snapNoop} />,
    );
  });
});
