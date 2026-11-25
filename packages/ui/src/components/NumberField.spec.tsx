import { describe, expect, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { NumberField } from './NumberField';
describe('NumberField', () => {
  test('renders a number input', () => {
    render(<NumberField aria-label="Count" />);
    expect(screen.getByLabelText('Count')).toHaveAttribute('type', 'number');
  });
});
