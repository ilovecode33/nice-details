import { useEffect, useLayoutEffect, useMemo, useState, type ReactNode } from 'react';
import { DEFAULT_THEME, STORAGE_KEY, ThemeContext, readSaved, systemPrefersDark } from '../hooks/useTheme';
import type { Theme, ThemeValue } from '@ilovecode33/ui-types';

export { DEFAULT_THEME } from '../hooks/useTheme';

/**
 * Provides theme context, applying the saved/default theme to `data-theme`
 * in a layout effect so dark mode is set before paint. Reads saved preferences
 * on mount, follows system changes for `system`, and persists to localStorage.
 */
export function ThemeProvider({
  children,
  defaultTheme = DEFAULT_THEME,
}: {
  children: ReactNode;
  defaultTheme?: Theme;
}) {
  const [theme, setThemeState] = useState<Theme>(() => readSaved(defaultTheme));
  const [systemDark, setSystemDark] = useState(systemPrefersDark);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => setSystemDark(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const resolved: 'light' | 'dark' =
    theme === 'system' ? (systemDark ? 'dark' : 'light') : theme;

  // Layout effect: commit the attribute before the browser paints. A passive
  // effect would leave one light frame on every full page load in dark mode.
  useLayoutEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  const value = useMemo<ThemeValue>(
    () => ({ theme, setTheme: setThemeState, resolved }),
    [theme, resolved],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
