import { describe, expect, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { PhotoGrid } from './PhotoGrid';
import { expectComponentSnapshot } from '../test-utils/snapshot';

const snapNoop = () => {};
const snapItems = [
  { id: 'a', title: 'First', alt: 'First' },
  { id: 'b', title: 'Second', alt: 'Second' },
];

describe('PhotoGrid', () => {
  test('opens a photo by index', () => {
    let opened = -1;
    const items = [{ id: 'a', alt: 'Mountains' }, { id: 'b', alt: 'Ocean' }];
    render(<PhotoGrid items={items} onOpen={(i) => (opened = i)} />);
    fireEvent.click(screen.getByRole('button', { name: 'Open Ocean' }));
    expect(opened).toBe(1);
  });

  test('matches its structural snapshot', () => {
    expectComponentSnapshot(<PhotoGrid items={snapItems} onOpen={snapNoop} />);
  });
});
