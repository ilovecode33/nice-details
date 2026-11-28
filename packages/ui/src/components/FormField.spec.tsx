import { describe, expect, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { expectComponentSnapshot } from '../test-utils/snapshot';
import { FormField } from './FormField';
describe('FormField', () => {
  test('associates a hint with the control', () => {
    render(<FormField label="Email" hint="Work email"><input /></FormField>);
    const control = screen.getByRole('textbox', { name: 'Email' });
    const describedBy = control.getAttribute('aria-describedby');

    expect(describedBy).toBeTruthy();
    expect(document.getElementById(describedBy!)).toHaveTextContent('Work email');
    expect(control).not.toHaveAttribute('aria-invalid');
  });

  test('associates an error with the control and announces it', () => {
    render(<FormField label="Email" hint="Work email" error="Required"><input /></FormField>);
    const control = screen.getByRole('textbox', { name: 'Email' });
    const alert = screen.getByRole('alert');

    expect(control).toHaveAttribute('aria-invalid', 'true');
    expect(control).toHaveAttribute('aria-describedby', alert.id);
    expect(alert).toHaveTextContent('Required');
    expect(screen.queryByText('Work email')).not.toBeInTheDocument();
  });

  test('matches its structural snapshot', () => {
    expectComponentSnapshot(
      <FormField label="Email" error="Required">
        <input aria-label="Email" />
      </FormField>,
    );
  });
});
