import { describe, expect, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { Card } from './Card';
describe('Card', () => {
  test('renders a title, subtitle and body', () => {
    render(<Card title="Album" subtitle="12 photos"><p>Content</p></Card>);
    expect(screen.getByRole('heading', { name: 'Album' })).toBeInTheDocument();
    expect(screen.getByText('12 photos')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });
});
