import type { LocaleValue } from '@ilovecode33/ui-types';
export type { LocaleValue } from '@ilovecode33/ui-types';
import { createContext, useContext } from 'react';


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
