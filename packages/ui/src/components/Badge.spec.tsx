import { describe, expect, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { Badge } from './Badge';
describe('Badge', () => {
  test('applies the requested tone', () => {
    render(<Badge tone="success">Live</Badge>);
    const badge = screen.getByText('Live');
    expect(badge.className).toContain('is-success');
  });
});
