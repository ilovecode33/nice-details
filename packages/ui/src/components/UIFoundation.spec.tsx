import { describe, expect, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { expectComponentSnapshot } from '../test-utils/snapshot';
import { UIFoundation } from './UIFoundation';
describe('UIFoundation', () => {
  test('renders its children', () => {
    render(<UIFoundation><span>App</span></UIFoundation>);
    expect(screen.getByText('App')).toBeInTheDocument();
  });

  test('matches its structural snapshot', () => {
    expectComponentSnapshot(
      <UIFoundation>
        <span>App</span>
      </UIFoundation>,
    );
  });
});
