import { createContext, useContext } from 'react';
import type { Theme, ThemeValue } from '@ilovecode33/ui-types';

export const DEFAULT_THEME: Theme = 'system';

export const STORAGE_KEY = 'gallery.theme';

export const ThemeContext = createContext<ThemeValue | null>(null);

/**
 * Check `prefers-color-scheme: dark` once at call time via `matchMedia`.
 * Returns false when `window` is unavailable (server rendering).
 */
export function systemPrefersDark(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );
}

/**
 * Read `gallery.theme` from `localStorage`, accepting only `light`, `dark`, or
 * `system`. Missing, invalid, or inaccessible storage falls back to
 * `defaultTheme`; no preference is detected from the OS here.
 */
export function readSaved(defaultTheme: Theme): Theme {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === 'light' || v === 'dark' || v === 'system') return v;
  } catch {
    /* storage unavailable */
  }
  return defaultTheme;
}

/**
 * Return the theme context: `theme`, the resolved `light`/`dark` value, and
 * `setTheme`. Throws when used outside `<ThemeProvider>`.
 *
 * @example
 * ```tsx
 * function ThemeStatus() {
 *   const { resolved, setTheme } = useTheme();
 *   return <button onClick={() => setTheme('system')}>Theme: {resolved}</button>;
 * }
 * ```
 */
export function useTheme(): ThemeValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within <ThemeProvider>');
  return ctx;
}
