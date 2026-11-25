import { describe, expect, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { AlertDialog } from './AlertDialog';
describe('AlertDialog', () => {
  test('renders the message and fires the confirm action', () => {
    let confirmed = false;
    render(
      <AlertDialog open title="Delete" message="Are you sure?" onClose={() => {}} onConfirm={() => (confirmed = true)} />,
    );
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));
    expect(confirmed).toBe(true);
  });
});
