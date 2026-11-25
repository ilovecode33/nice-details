import { describe, expect, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { AccentProvider } from '../components/AccentProvider';
import { ThemeProvider } from '../components/ThemeProvider';
import { useAccent } from './useAccent';

describe('useAccent', () => {
  test('exposes the active accent and lets a consumer change it', () => {
    function Probe() {
      const { accent, setAccent } = useAccent();
      return <button onClick={() => setAccent('growth')}>{accent}</button>;
    }
    render(<ThemeProvider><AccentProvider><Probe /></AccentProvider></ThemeProvider>);
    const button = screen.getByRole('button');
    expect(button.textContent).toBeTruthy();
    fireEvent.click(button);
    expect(button).toHaveTextContent('growth');
  });
});
