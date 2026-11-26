import { describe, expect, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { expectComponentSnapshot } from '../test-utils/snapshot';
import { DatePicker } from './DatePicker';
describe('DatePicker', () => {
  test('renders a date input', () => {
    render(<DatePicker aria-label="Start date" />);
    expect(screen.getByLabelText('Start date')).toHaveAttribute('type', 'date');
  });

  test('matches its structural snapshot', () => {
    expectComponentSnapshot(<DatePicker aria-label="Start date" />);
  });
});
