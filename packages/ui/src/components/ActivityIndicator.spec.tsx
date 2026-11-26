import { describe, expect, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { expectComponentSnapshot } from '../test-utils/snapshot';
import { ActivityIndicator } from './ActivityIndicator';
describe('ActivityIndicator', () => {
  test('exposes a labelled status', () => {
    render(<ActivityIndicator label="Loading photos" />);
    expect(screen.getByRole('status', { name: 'Loading photos' })).toBeInTheDocument();
  });

  test('matches its structural snapshot', () => {
    expectComponentSnapshot(<ActivityIndicator label="Loading photos" />);
  });
});
