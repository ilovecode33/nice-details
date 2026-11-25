import { createContext, useContext } from 'react';

export interface LocaleValue {
  locale: string;
  setLocale: (locale: string) => void;
  t: (key: string) => string;
  dictionary: Record<string, string>;
}

const LocaleContext = createContext<LocaleValue | null>(null);

function readSavedLocale(key: string, fallback: string): string {
  if (!key || typeof window === 'undefined') return fallback;
  try {
    return window.localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

export function useLocale(): LocaleValue {
  const value = useContext(LocaleContext);
  if (!value) throw new Error('useLocale must be used within <UIFoundation>');
  return value;
}

export { LocaleContext, readSavedLocale };
