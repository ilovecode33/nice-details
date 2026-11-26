import { describe, expect, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { expectComponentSnapshot } from '../test-utils/snapshot';
import { TextInput } from './TextInput';
describe('TextInput', () => {
  test('renders an input', () => {
    render(<TextInput aria-label="Name" />);
    expect(screen.getByRole('textbox', { name: 'Name' })).toBeInTheDocument();
  });

  test('matches its structural snapshot', () => {
    expectComponentSnapshot(<TextInput aria-label="Name" />);
  });
});
