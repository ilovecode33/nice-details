import { describe, expect, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { ThemeProvider } from '../components/ThemeProvider';
import { useTheme } from './useTheme';

describe('useTheme', () => {
  test('exposes the active theme and lets a consumer change it', () => {
    function Probe() {
      const { theme, setTheme, resolved } = useTheme();
      return (
        <button onClick={() => setTheme('light')}>
          {theme}/{resolved}
        </button>
      );
    }
    render(<ThemeProvider defaultTheme="dark"><Probe /></ThemeProvider>);
    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('dark');
    fireEvent.click(button);
    expect(button).toHaveTextContent('light');
  });
});
