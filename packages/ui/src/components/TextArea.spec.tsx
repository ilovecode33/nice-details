import { describe, expect, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { expectComponentSnapshot } from '../test-utils/snapshot';
import { TextArea } from './TextArea';
describe('TextArea', () => {
  test('renders a textarea', () => {
    render(<TextArea aria-label="Notes" />);
    expect(screen.getByRole('textbox', { name: 'Notes' })).toBeInTheDocument();
  });

  test('matches its structural snapshot', () => {
    expectComponentSnapshot(<TextArea aria-label="Notes" />);
  });
});
