import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  ACCENTS,
  ACCENT_PALETTES,
  DEFAULT_ACCENT,
  type Accent,
} from '@ilovecode33/ui-tokens';
import { Select } from './Select';
import { useTheme } from './ThemeProvider';

/** Token definitions are owned by `@ilovecode33/ui-tokens` and re-exported for API stability. */
export {
  ACCENTS,
  ACCENT_PALETTES,
  DEFAULT_ACCENT,
  type Accent,
  type Palette,
} from '@ilovecode33/ui-tokens';

const STORAGE_KEY = 'gallery.accent';

function readSaved(defaultAccent: Accent): Accent {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (ACCENTS.includes(v as Accent)) return v as Accent;
  } catch {
    /* storage unavailable */
  }
  return defaultAccent;
}

interface AccentValue {
  accent: Accent;
  setAccent: (a: Accent) => void;
}

const AccentContext = createContext<AccentValue | null>(null);

export function AccentProvider({
  children,
  defaultAccent = DEFAULT_ACCENT,
}: {
  children: ReactNode;
  defaultAccent?: Accent;
}) {
  const [accent, setAccentState] = useState<Accent>(() =>
    readSaved(defaultAccent),
  );
  const { resolved } = useTheme();

  useEffect(() => {
    document.documentElement.setAttribute('data-accent', accent);
    try {
      localStorage.setItem(STORAGE_KEY, accent);
    } catch {
      /* ignore */
    }
  }, [accent]);

  // Apply the palette as inline variables on <html> before paint so a saved
  // mood never flashes the default color.
  useLayoutEffect(() => {
    const p = ACCENT_PALETTES[accent][resolved];
    const root = document.documentElement;
    root.style.setProperty('--accent', p.accent);
    root.style.setProperty('--accent-ink', p.ink);
    root.style.setProperty('--accent-soft', p.soft);
    root.style.setProperty('--accent-glow', p.glow);
    root.style.setProperty('--accent-tint', p.tint);
    root.style.setProperty(
      '--bg-gradient',
      `radial-gradient(1100px 700px at 12% -12%, ${p.tint}, transparent 60%), radial-gradient(900px 620px at 92% -4%, ${p.tint}, transparent 55%)`,
    );
  }, [accent, resolved]);

  const value = useMemo(() => ({ accent, setAccent: setAccentState }), [accent]);
  return (
    <AccentContext.Provider value={value}>{children}</AccentContext.Provider>
  );
}

export function useAccent(): AccentValue {
  const ctx = useContext(AccentContext);
  if (!ctx) throw new Error('useAccent must be used within <AccentProvider>');
  return ctx;
}