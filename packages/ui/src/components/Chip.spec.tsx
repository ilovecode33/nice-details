import { describe, expect, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { Chip } from './Chip';
describe('Chip', () => {
  test('exposes selection through aria-pressed', () => {
    render(<Chip selected>Favorites</Chip>);
    expect(screen.getByRole('button', { name: 'Favorites' })).toHaveAttribute('aria-pressed', 'true');
  });
});
