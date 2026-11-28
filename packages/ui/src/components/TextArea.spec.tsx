import { describe, expect, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { expectComponentSnapshot } from '../test-utils/snapshot';
import { TextArea } from './TextArea';
describe('TextArea', () => {
  test('renders a textarea', () => {
    render(<TextArea aria-label="Notes" />);
    expect(screen.getByRole('textbox', { name: 'Notes' })).toBeInTheDocument();
  });

  test('forwards native textarea state and attributes', () => {
    render(<TextArea aria-label="Notes" aria-invalid="true" maxLength={120} />);
    const textarea = screen.getByRole('textbox', { name: 'Notes' });

    expect(textarea).toHaveAttribute('aria-invalid', 'true');
    expect(textarea).toHaveAttribute('maxlength', '120');
    fireEvent.change(textarea, { target: { value: 'A short note' } });
    expect(textarea).toHaveValue('A short note');
  });

  test('matches its structural snapshot', () => {
    expectComponentSnapshot(<TextArea aria-label="Notes" />);
  });
});
