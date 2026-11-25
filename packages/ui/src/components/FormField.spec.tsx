import { describe, expect, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { FormField } from './FormField';
describe('FormField', () => {
  test('renders an error with the alert role', () => {
    render(<FormField label="Email" error="Required"><input aria-label="Email" /></FormField>);
    expect(screen.getByRole('alert')).toHaveTextContent('Required');
  });
});
