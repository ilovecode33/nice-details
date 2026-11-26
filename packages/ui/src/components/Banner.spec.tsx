import { describe, expect, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { expectComponentSnapshot } from '../test-utils/snapshot';
import { Banner } from './Banner';

const snapNoop = () => {};

describe('Banner', () => {
  test('shows its message and a dismiss button', () => {
    let dismissed = false;
    render(<Banner message="Saved" onDismiss={() => (dismissed = true)} />);
    expect(screen.getByText('Saved')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(dismissed).toBe(true);
  });

  test('matches its structural snapshot', () => {
    expectComponentSnapshot(<Banner message="Saved" onDismiss={snapNoop} />);
  });
});
