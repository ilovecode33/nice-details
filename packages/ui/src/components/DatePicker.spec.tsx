import { describe, expect, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { DatePicker } from './DatePicker';
describe('DatePicker', () => {
  test('renders a date input', () => {
    render(<DatePicker aria-label="Start date" />);
    expect(screen.getByLabelText('Start date')).toHaveAttribute('type', 'date');
  });
});
