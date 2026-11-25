import { describe, expect, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { Sheet } from './Sheet';
describe('Sheet', () => {
  test('renders a modal dialog when open', () => {
    render(<Sheet open title="Details" onClose={() => {}}><p>Body</p></Sheet>);
    expect(screen.getByRole('dialog', { name: 'Details' })).toBeInTheDocument();
    expect(screen.getByText('Body')).toBeInTheDocument();
  });
});
