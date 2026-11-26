import { describe, expect, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { expectComponentSnapshot } from '../test-utils/snapshot';
import { List } from './List';
describe('List', () => {
  test('marks the selected item with aria-current', () => {
    const items = [{ id: 'a', title: 'First' }, { id: 'b', title: 'Second' }];
    render(<List items={items} selectedId="a" label="Albums" />);
    expect(screen.getByRole('list', { name: 'Albums' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'First' })).toHaveAttribute('aria-current', 'true');
  });

  const snapItems = [
    { id: 'a', title: 'First', alt: 'First' },
    { id: 'b', title: 'Second', alt: 'Second' },
  ];

  test('matches its structural snapshot', () => {
    expectComponentSnapshot(<List items={snapItems} selectedId="a" label="Albums" />);
  });
});
