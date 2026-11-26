import { describe, expect, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { ProgressBar } from './ProgressBar';
import { expectComponentSnapshot } from '../test-utils/snapshot';

describe('ProgressBar', () => {
  test('exposes the current value', () => {
    render(<ProgressBar value={40} label="Upload" />);
    expect(screen.getByRole('progressbar', { name: 'Upload' })).toHaveAttribute('aria-valuenow', '40');
  });

  test('matches its structural snapshot', () => {
    expectComponentSnapshot(<ProgressBar value={40} label="Upload" />);
  });
});
