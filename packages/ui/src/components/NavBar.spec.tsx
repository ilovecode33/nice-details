import { describe, expect, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { expectComponentSnapshot } from '../test-utils/snapshot';
import { NavBar } from './NavBar';
describe('NavBar', () => {
  test('renders a title and a back button', () => {
    let back = false;
    render(<NavBar title="Album" onBack={() => (back = true)} />);
    expect(screen.getByRole('heading', { name: 'Album' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(back).toBe(true);
  });

  const snapNoop = () => {};

  test('matches its structural snapshot', () => {
    expectComponentSnapshot(<NavBar title="Album" onBack={snapNoop} />);
  });
});
