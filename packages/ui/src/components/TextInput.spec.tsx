import { describe, expect, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { expectComponentSnapshot } from '../test-utils/snapshot';
import { TextInput } from './TextInput';
describe('TextInput', () => {
  test('renders an input', () => {
    render(<TextInput aria-label="Name" />);
    expect(screen.getByRole('textbox', { name: 'Name' })).toBeInTheDocument();
  });

  test('forwards native input state and attributes', () => {
    render(<TextInput aria-label="Name" aria-invalid="true" required />);
    const input = screen.getByRole('textbox', { name: 'Name' });

    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toBeRequired();
    fireEvent.change(input, { target: { value: 'Summer trip' } });
    expect(input).toHaveValue('Summer trip');
  });

  test('matches its structural snapshot', () => {
    expectComponentSnapshot(<TextInput aria-label="Name" />);
  });
});
