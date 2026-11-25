import { describe, expect, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { ProgressBar } from './ProgressBar';
describe('ProgressBar', () => {
  test('exposes the current value', () => {
    render(<ProgressBar value={40} label="Upload" />);
    expect(screen.getByRole('progressbar', { name: 'Upload' })).toHaveAttribute('aria-valuenow', '40');
  });
});
