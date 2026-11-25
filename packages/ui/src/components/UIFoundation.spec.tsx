import { describe, expect, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { UIFoundation } from './UIFoundation';
describe('UIFoundation', () => {
  test('renders its children', () => {
    render(<UIFoundation><span>App</span></UIFoundation>);
    expect(screen.getByText('App')).toBeInTheDocument();
  });
});
