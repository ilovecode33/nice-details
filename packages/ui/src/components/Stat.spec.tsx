import { describe, expect, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { expectComponentSnapshot } from '../test-utils/snapshot';
import { Stat } from './Stat';
describe('Stat', () => {
  test('renders a value and label', () => {
    render(<Stat label="Photos" value={12} />);
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('Photos')).toBeInTheDocument();
  });

  test('matches its structural snapshot', () => {
    expectComponentSnapshot(<Stat label="Photos" value={12} />);
  });
});
