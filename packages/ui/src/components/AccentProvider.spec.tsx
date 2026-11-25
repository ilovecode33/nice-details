import { describe, expect, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { useAccent } from '../hooks/useAccent';
import { AccentProvider } from './AccentProvider';
import { ThemeProvider } from './ThemeProvider';
describe('AccentProvider', () => {
  test('exposes the default accent to consumers', () => {
    let seen = '';
    function Probe() {
      const { accent } = useAccent();
      seen = accent;
      return <span>{accent}</span>;
    }
    render(<ThemeProvider><AccentProvider><Probe /></AccentProvider></ThemeProvider>);
    expect(seen).toBeTruthy();
    expect(screen.getByText(seen)).toBeInTheDocument();
  });
});
