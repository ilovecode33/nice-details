import type { UIFoundationProps } from '@ilovecode33/ui-types';
import styles from './UIFoundation.module.css';
import { useEffect, useMemo, useState } from 'react';
import { DEFAULT_THEME } from '../hooks/useTheme';

import { DEFAULT_ACCENT } from '@ilovecode33/ui-tokens';
import { LocaleContext, readSavedLocale } from '../hooks/useLocale';
import type { LocaleValue } from '@ilovecode33/ui-types';
import { ThemeProvider } from './ThemeProvider';
import { AccentProvider } from './AccentProvider';

/**
 * Single entry point composing theme, accent, and locale context providers,
 * with `defaultTheme`/`defaultAccent` overrides.
 * Locale is controlled via `locale` or uncontrolled via `defaultLocale`
 * (default 'en'); dictionaries come from the host and `t` falls back to the key.
 * Wrapped content disables text selection; form fields keep it.
 */
export function UIFoundation({
  children,
  defaultTheme = DEFAULT_THEME,
  defaultAccent = DEFAULT_ACCENT,
  locale: controlledLocale,
  defaultLocale = 'en',
  onLocaleChange,
  dictionary,
  dictionaries,
  localeStorageKey = 'ui.locale',
  className = '',
}: UIFoundationProps) {
  const [internalLocale, setInternalLocale] = useState(() =>
    readSavedLocale(localeStorageKey, defaultLocale),
  );
  const locale = controlledLocale ?? internalLocale;
  const activeDictionary = dictionary ?? dictionaries?.[locale] ?? {};

  useEffect(() => {
    if (typeof document !== 'undefined') document.documentElement.lang = locale;
    if (!localeStorageKey || controlledLocale !== undefined) return;
    try {
      window.localStorage.setItem(localeStorageKey, locale);
    } catch {
      /* storage unavailable */
    }
  }, [locale, localeStorageKey, controlledLocale]);

  /** Updates internal locale only when uncontrolled, and notifies the host either way. */
  const setLocale = (next: string) => {
    if (controlledLocale === undefined) setInternalLocale(next);
    onLocaleChange?.(next);
  };

  const value = useMemo<LocaleValue>(
    () => ({
      locale,
      setLocale,
      dictionary: activeDictionary,
      t: (key: string) => activeDictionary[key] ?? key,
    }),
    [locale, activeDictionary],
  );

  return (
    <ThemeProvider defaultTheme={defaultTheme}>
      <AccentProvider defaultAccent={defaultAccent}>
        <LocaleContext.Provider value={value}>
          <div className={[styles['ui-foundation'], className].filter(Boolean).join(' ')}>{children}</div>
        </LocaleContext.Provider>
      </AccentProvider>
    </ThemeProvider>
  );
}
