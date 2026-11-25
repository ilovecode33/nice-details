import { describe, expect, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { Banner } from './Banner';
describe('Banner', () => {
  test('shows its message and a dismiss button', () => {
    let dismissed = false;
    render(<Banner message="Saved" onDismiss={() => (dismissed = true)} />);
    expect(screen.getByText('Saved')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(dismissed).toBe(true);
  });
});
