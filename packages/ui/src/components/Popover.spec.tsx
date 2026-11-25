import { describe, expect, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { Popover } from './Popover';
describe('Popover', () => {
  test('renders only when open', () => {
    const { rerender } = render(<Popover open={false} label="Info" onClose={() => {}}><p>Body</p></Popover>);
    expect(screen.queryByRole('dialog')).toBeNull();
    rerender(<Popover open label="Info" onClose={() => {}}><p>Body</p></Popover>);
    expect(screen.getByRole('dialog', { name: 'Info' })).toBeInTheDocument();
  });
});
