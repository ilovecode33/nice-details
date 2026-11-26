import { describe, expect, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { expectComponentSnapshot } from '../test-utils/snapshot';
import { Chip } from './Chip';
describe('Chip', () => {
  test('exposes selection through aria-pressed', () => {
    render(<Chip selected>Favorites</Chip>);
    expect(screen.getByRole('button', { name: 'Favorites' })).toHaveAttribute('aria-pressed', 'true');
  });

  test('matches its structural snapshot', () => {
    expectComponentSnapshot(<Chip selected>Favorites</Chip>);
  });
});
