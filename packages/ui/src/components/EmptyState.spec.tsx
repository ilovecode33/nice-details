import { describe, expect, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { EmptyState } from './EmptyState';
describe('EmptyState', () => {
  test('renders a title and detail', () => {
    render(<EmptyState title="No photos" detail="Try another album" />);
    expect(screen.getByText('No photos')).toBeInTheDocument();
    expect(screen.getByText('Try another album')).toBeInTheDocument();
  });
});
