import { describe, expect, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { TabBar } from './TabBar';
describe('TabBar', () => {
  test('marks the active tab and reports selection', () => {
    let picked = '';
    const items = [{ value: 'a', label: 'First' }, { value: 'b', label: 'Second' }];
    render(<TabBar label="Sections" items={items} value="a" onChange={(v) => (picked = v)} />);
    expect(screen.getByRole('tab', { name: 'First' })).toHaveAttribute('aria-selected', 'true');
    fireEvent.click(screen.getByRole('tab', { name: 'Second' }));
    expect(picked).toBe('b');
  });
});
