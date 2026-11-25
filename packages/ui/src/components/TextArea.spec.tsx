import { describe, expect, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { TextArea } from './TextArea';
describe('TextArea', () => {
  test('renders a textarea', () => {
    render(<TextArea aria-label="Notes" />);
    expect(screen.getByRole('textbox', { name: 'Notes' })).toBeInTheDocument();
  });
});
