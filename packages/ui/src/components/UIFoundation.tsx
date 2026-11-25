import styles from './UIFoundation.module.css';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { DEFAULT_THEME, type Theme } from '../hooks/useTheme';
import { DEFAULT_ACCENT, type Accent } from '@ilovecode33/ui-tokens';
import { LocaleContext, readSavedLocale, type LocaleValue } from '../hooks/useLocale';
import { ThemeProvider } from './ThemeProvider';
import { AccentProvider } from './AccentProvider';

/**
 * UIFoundation — the single entry point for theme, accent and locale context.
 *
 * The library stays i18n-package-free: the host supplies plain dictionaries.
 * Wrapped content disables text selection by default because it conflicts with
 * the elastic drag feedback; form fields keep normal text selection.
 */
export interface UIFoundationProps {
  children: ReactNode;
  defaultTheme?: Theme;
  defaultAccent?: Accent;
  /** Controlled locale. */
  locale?: string;
  defaultLocale?: string;
  onLocaleChange?: (locale: string) => void;
  /** Active message map. */
  dictionary?: Record<string, string>;
  /** All locales keyed by locale name; resolved from `locale`. */
  dictionaries?: Record<string, Record<string, string>>;
  /** localStorage key for the locale. Empty string disables persistence. */
  localeStorageKey?: string;
  className?: string;
}

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
