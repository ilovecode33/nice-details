import { describe, expect, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from './ThemeProvider';
import { ThemeSwitcher } from './ThemeSwitcher';
describe('ThemeSwitcher', () => {
  test('offers three appearance options', () => {
    render(<ThemeProvider><ThemeSwitcher labels={{ group: 'Appearance', system: 'System', light: 'Light', dark: 'Dark' }} /></ThemeProvider>);
    const group = screen.getByRole('group', { name: 'Appearance' });
    expect(group).toBeInTheDocument();
    expect(group.querySelectorAll('button')).toHaveLength(3);
  });
});
