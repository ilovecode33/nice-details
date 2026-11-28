import { useEffect } from 'react';
import { useTheme } from '@ilovecode33/ui';
import { applyThemeChrome } from './themeChrome';

/** Keeps the status bar and browser chrome in sync with the resolved theme. */
export function useThemeChrome(): void {
  const { resolved } = useTheme();
  useEffect(() => {
    applyThemeChrome(resolved);
  }, [resolved]);
}
