import { createContext, useContext } from 'react';
import { ACCENTS, type Accent } from '@ilovecode33/ui-tokens';

export const STORAGE_KEY = 'gallery.accent';

export function readSaved(defaultAccent: Accent): Accent {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (ACCENTS.includes(v as Accent)) return v as Accent;
  } catch {
    /* storage unavailable */
  }
  return defaultAccent;
}

export interface AccentValue {
  accent: Accent;
  setAccent: (a: Accent) => void;
}

export const AccentContext = createContext<AccentValue | null>(null);

export function useAccent(): AccentValue {
  const ctx = useContext(AccentContext);
  if (!ctx) throw new Error('useAccent must be used within <AccentProvider>');
  return ctx;
}
