import { describe, expect, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { Toast } from './Toast';
describe('Toast', () => {
  test('shows its message and can be dismissed', () => {
    let dismissed = false;
    render(<Toast visible message="Saved" onDismiss={() => (dismissed = true)} />);
    expect(screen.getByText('Saved')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(dismissed).toBe(true);
  });
});
