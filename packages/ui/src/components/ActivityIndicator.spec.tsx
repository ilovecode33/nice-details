import { describe, expect, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { ActivityIndicator } from './ActivityIndicator';
describe('ActivityIndicator', () => {
  test('exposes a labelled status', () => {
    render(<ActivityIndicator label="Loading photos" />);
    expect(screen.getByRole('status', { name: 'Loading photos' })).toBeInTheDocument();
  });
});
