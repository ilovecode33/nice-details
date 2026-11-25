import { describe, expect, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { useTheme } from '../hooks/useTheme';
import { ThemeProvider } from './ThemeProvider';
describe('ThemeProvider', () => {
  test('exposes the default theme to consumers', () => {
    let seen = '';
    function Probe() {
      const { theme } = useTheme();
      seen = theme;
      return <span>{theme}</span>;
    }
    render(<ThemeProvider defaultTheme="dark"><Probe /></ThemeProvider>);
    expect(seen).toBe('dark');
    expect(screen.getByText('dark')).toBeInTheDocument();
  });
});
