import type { LocaleValue } from '@ilovecode33/ui-types';
import { createContext, useContext } from 'react';

const LocaleContext = createContext<LocaleValue | null>(null);

/**
 * Read a persisted locale string from `localStorage` by `key`. An empty key,
 * missing entry, absent `window`, or storage error returns `fallback`; stored
 * values are returned as-is without locale validation.
 */
function readSavedLocale(key: string, fallback: string): string {
  if (!key || typeof window === 'undefined') return fallback;
  try {
    return window.localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

/**
 * Return the locale context from `<UIFoundation>`: the active `locale`, `setLocale`,
 * the `t` translator, and the current `dictionary`. Throws outside the provider.
 */
export function useLocale(): LocaleValue {
  const value = useContext(LocaleContext);
  if (!value) throw new Error('useLocale must be used within <UIFoundation>');
  return value;
}

export { LocaleContext, readSavedLocale };
