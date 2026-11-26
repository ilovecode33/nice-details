import { describe, expect, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { expectComponentSnapshot } from '../test-utils/snapshot';
import { Carousel } from './Carousel';

const snapNoop = () => {};

describe('Carousel', () => {
  test('renders slides and reports navigation', () => {
    let next = -1;
    const items = [{ id: 'a', alt: 'A' }, { id: 'b', alt: 'B' }];
    render(<Carousel items={items} index={0} onIndexChange={(i) => (next = i)} />);
    expect(screen.getByRole('region', { name: 'Carousel' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Next slide' }));
    expect(next).toBe(1);
  });

  test('matches its structural snapshot', () => {
    expectComponentSnapshot(
      <Carousel
        items={[
          { id: 'a', alt: 'A' },
          { id: 'b', alt: 'B' },
        ]}
        index={0}
        onIndexChange={snapNoop}
      />,
    );
  });
});
