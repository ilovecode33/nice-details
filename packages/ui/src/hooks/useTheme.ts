import { createContext, useContext } from 'react';
import type { Theme, ThemeValue } from '@ilovecode33/ui-types';


export const DEFAULT_THEME: Theme = 'system';

export const STORAGE_KEY = 'gallery.theme';

export const ThemeContext = createContext<ThemeValue | null>(null);

export function systemPrefersDark(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );
}

export function readSaved(defaultTheme: Theme): Theme {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === 'light' || v === 'dark' || v === 'system') return v;
  } catch {
    /* storage unavailable */
  }
  return defaultTheme;
}

export function useTheme(): ThemeValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within <ThemeProvider>');
  return ctx;
}
