import type { AccentValue } from '@ilovecode33/ui-types';
import { createContext, useContext } from 'react';
import { ACCENTS, type Accent } from '@ilovecode33/ui-tokens';

export const STORAGE_KEY = 'gallery.accent';

/**
 * Read the persisted accent from `localStorage` (`gallery.accent`). A stored value
 * is accepted only when it appears in `ACCENTS`; missing, invalid, or inaccessible
 * storage falls back to `defaultAccent`, including during SSR.
 */
export function readSaved(defaultAccent: Accent): Accent {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (ACCENTS.includes(v as Accent)) return v as Accent;
  } catch {
    /* storage unavailable */
  }
  return defaultAccent;
}

export const AccentContext = createContext<AccentValue | null>(null);

/**
 * Return the accent context (`accent` and `setAccent`) supplied by
 * `<AccentProvider>`. Throws when called outside that provider so consumers
 * always receive a non-null value.
 */
export function useAccent(): AccentValue {
  const ctx = useContext(AccentContext);
  if (!ctx) throw new Error('useAccent must be used within <AccentProvider>');
  return ctx;
}
