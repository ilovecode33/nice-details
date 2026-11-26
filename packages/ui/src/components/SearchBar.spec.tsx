import { describe, expect, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { SearchBar } from './SearchBar';
import { expectComponentSnapshot } from '../test-utils/snapshot';

const snapNoop = () => {};

describe('SearchBar', () => {
  test('reports typing and clearing', () => {
    let typed = '';
    let cleared = false;
    const { rerender } = render(<SearchBar value="" onChange={(v) => (typed = v)} onClear={() => (cleared = true)} />);
    fireEvent.change(screen.getByRole('searchbox', { name: 'Search' }), { target: { value: 'cat' } });
    expect(typed).toBe('cat');
    rerender(<SearchBar value="cat" onChange={(v) => (typed = v)} onClear={() => (cleared = true)} />);
    fireEvent.click(screen.getByRole('button', { name: 'Clear search' }));
    expect(cleared).toBe(true);
  });

  test('matches its structural snapshot', () => {
    expectComponentSnapshot(<SearchBar value="cat" onChange={snapNoop} onClear={snapNoop} />);
  });
});
