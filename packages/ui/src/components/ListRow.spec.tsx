import { describe, expect, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { expectComponentSnapshot } from '../test-utils/snapshot';
import { ListRow } from './ListRow';
describe('ListRow', () => {
  test('reports selection on click', () => {
    let selected = '';
    const item = { id: 'a', title: 'First' };
    render(<ul><ListRow item={item} onSelect={(id) => (selected = id)} /></ul>);
    fireEvent.click(screen.getByRole('button', { name: 'First' }));
    expect(selected).toBe('a');
  });

  const snapItems = [
    { id: 'a', title: 'First', alt: 'First' },
    { id: 'b', title: 'Second', alt: 'Second' },
  ];
  const snapNoop = () => {};

  test('matches its structural snapshot', () => {
    expectComponentSnapshot(
      <ul>
        <ListRow item={snapItems[0]} onSelect={snapNoop} />
      </ul>,
    );
  });
});
