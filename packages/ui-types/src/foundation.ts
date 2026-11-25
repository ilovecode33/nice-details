import type { ReactNode } from 'react';
import type { Accent } from '@ilovecode33/ui-tokens';
import type { Theme } from './appearance';

export interface LocaleValue {
  locale: string;
  setLocale: (locale: string) => void;
  t: (key: string) => string;
  dictionary: Record<string, string>;
}

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
