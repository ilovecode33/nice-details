import { describe, expect, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { expectComponentSnapshot } from '../test-utils/snapshot';
import { NumberField } from './NumberField';
describe('NumberField', () => {
  test('renders a number input', () => {
    render(<NumberField aria-label="Count" />);
    expect(screen.getByLabelText('Count')).toHaveAttribute('type', 'number');
  });

  test('matches its structural snapshot', () => {
    expectComponentSnapshot(<NumberField aria-label="Count" />);
  });
});
