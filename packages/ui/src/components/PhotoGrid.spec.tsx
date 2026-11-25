import { describe, expect, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { PhotoGrid } from './PhotoGrid';
describe('PhotoGrid', () => {
  test('opens a photo by index', () => {
    let opened = -1;
    const items = [{ id: 'a', alt: 'Mountains' }, { id: 'b', alt: 'Ocean' }];
    render(<PhotoGrid items={items} onOpen={(i) => (opened = i)} />);
    fireEvent.click(screen.getByRole('button', { name: 'Open Ocean' }));
    expect(opened).toBe(1);
  });
});
