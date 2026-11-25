import { describe, expect, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { UIFoundation } from './UIFoundation';
import { AccentSwitcher } from './AccentSwitcher';
describe('AccentSwitcher', () => {
  test('renders a labelled accent picker', () => {
    render(<UIFoundation><AccentSwitcher labels={{ group: 'Accent color' }} /></UIFoundation>);
    expect(screen.getByRole('combobox', { name: 'Accent color' })).toBeInTheDocument();
  });
});
