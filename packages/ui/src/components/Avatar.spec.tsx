import { describe, expect, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { expectComponentSnapshot } from '../test-utils/snapshot';
import { Avatar } from './Avatar';
describe('Avatar', () => {
  test('derives initials from the name', () => {
    render(<Avatar name="Ada Lovelace" />);
    expect(screen.getByRole('img', { name: 'Ada Lovelace' })).toHaveTextContent('AL');
  });

  test('matches its structural snapshot', () => {
    expectComponentSnapshot(<Avatar name="Ada Lovelace" />);
  });
});
