import { describe, expect, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { expectComponentSnapshot } from '../test-utils/snapshot';
import { FormField } from './FormField';
describe('FormField', () => {
  test('renders an error with the alert role', () => {
    render(<FormField label="Email" error="Required"><input aria-label="Email" /></FormField>);
    expect(screen.getByRole('alert')).toHaveTextContent('Required');
  });

  test('matches its structural snapshot', () => {
    expectComponentSnapshot(
      <FormField label="Email" error="Required">
        <input aria-label="Email" />
      </FormField>,
    );
  });
});
