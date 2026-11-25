import { describe, expect, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { TextInput } from './TextInput';
describe('TextInput', () => {
  test('renders an input', () => {
    render(<TextInput aria-label="Name" />);
    expect(screen.getByRole('textbox', { name: 'Name' })).toBeInTheDocument();
  });
});
