import { describe, expect, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { Carousel } from './Carousel';
describe('Carousel', () => {
  test('renders slides and reports navigation', () => {
    let next = -1;
    const items = [{ id: 'a', alt: 'A' }, { id: 'b', alt: 'B' }];
    render(<Carousel items={items} index={0} onIndexChange={(i) => (next = i)} />);
    expect(screen.getByRole('region', { name: 'Carousel' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Next slide' }));
    expect(next).toBe(1);
  });
});
