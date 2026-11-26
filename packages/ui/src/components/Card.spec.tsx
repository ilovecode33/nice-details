import { describe, expect, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { expectComponentSnapshot } from '../test-utils/snapshot';
import { Card } from './Card';
describe('Card', () => {
  test('renders a title, subtitle and body', () => {
    render(<Card title="Album" subtitle="12 photos"><p>Content</p></Card>);
    expect(screen.getByRole('heading', { name: 'Album' })).toBeInTheDocument();
    expect(screen.getByText('12 photos')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  test('matches its structural snapshot', () => {
    expectComponentSnapshot(
      <Card title="Album" subtitle="12 photos">
        <p>Content</p>
      </Card>,
    );
  });
});
