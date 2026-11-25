import { describe, expect, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { ListRow } from './ListRow';
describe('ListRow', () => {
  test('reports selection on click', () => {
    let selected = '';
    const item = { id: 'a', title: 'First' };
    render(<ul><ListRow item={item} onSelect={(id) => (selected = id)} /></ul>);
    fireEvent.click(screen.getByRole('button', { name: 'First' }));
    expect(selected).toBe('a');
  });
});
