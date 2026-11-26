import { describe, expect, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { useTheme } from '../hooks/useTheme';
import { expectComponentSnapshot } from '../test-utils/snapshot';
import { ThemeProvider } from './ThemeProvider';

function SnapshotThemeProbe() {
  const { theme } = useTheme();
  return <span>{theme}</span>;
}

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

  test('matches its structural snapshot', () => {
    expectComponentSnapshot(
      <ThemeProvider defaultTheme="dark">
        <SnapshotThemeProbe />
      </ThemeProvider>,
    );
  });
});
