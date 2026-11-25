import { describe, expect, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { Stat } from './Stat';
describe('Stat', () => {
  test('renders a value and label', () => {
    render(<Stat label="Photos" value={12} />);
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('Photos')).toBeInTheDocument();
  });
});
