import { describe, expect, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { Disclosure } from './Disclosure';
describe('Disclosure', () => {
  test('toggles its expanded state', () => {
    render(<Disclosure title="Details"><p>Body</p></Disclosure>);
    const trigger = screen.getByRole('button', { name: 'Details' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(trigger);
    expect(screen.getByRole('button', { name: 'Details' })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Body')).toBeInTheDocument();
  });
});
