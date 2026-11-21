import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { Select } from './components';
import { useTheme } from './theme';

/**
 * Accent colors are named by meaning, never by the color itself.
 * Each palette is adjusted for light and dark themes so text contrast stays sufficient.
 */
export const ACCENTS = [
  'warmth',
  'serenity',
  'growth',
  'gentle',
  'vitality',
] as const;
export type Accent = (typeof ACCENTS)[number];
export const DEFAULT_ACCENT: Accent = 'warmth';

export interface Palette {
  accent: string;
  ink: string; // text on top of accent
  soft: string; // subtle tinted background
  glow: string; // halo / focus ring
  tint: string; // page background radial wash
}

export const ACCENT_PALETTES: Record<Accent, Record<'light' | 'dark', Palette>> = {
  warmth: {
    light: {
      accent: '#b23a0a',
      ink: '#ffffff',
      soft: 'rgba(178,58,10,0.12)',
      glow: 'rgba(178,58,10,0.45)',
      tint: 'rgba(178,58,10,0.08)',
    },
    dark: {
      accent: '#ff9a76',
      ink: '#2a0e04',
      soft: 'rgba(255,154,118,0.16)',
      glow: 'rgba(255,154,118,0.55)',
      tint: 'rgba(255,154,118,0.07)',
    },
  },
  serenity: {
    light: {
      accent: '#1565c0',
      ink: '#ffffff',
      soft: 'rgba(21,101,192,0.12)',
      glow: 'rgba(21,101,192,0.4)',
      tint: 'rgba(21,101,192,0.08)',
    },
    dark: {
      accent: '#7ab8ff',
      ink: '#082744',
      soft: 'rgba(122,184,255,0.16)',
      glow: 'rgba(122,184,255,0.5)',
      tint: 'rgba(122,184,255,0.07)',
    },
  },
  growth: {
    light: {
      accent: '#2e7d32',
      ink: '#ffffff',
      soft: 'rgba(46,125,50,0.12)',
      glow: 'rgba(46,125,50,0.4)',
      tint: 'rgba(46,125,50,0.08)',
    },
    dark: {
      accent: '#8fd694',
      ink: '#0a2a0d',
      soft: 'rgba(143,214,148,0.16)',
      glow: 'rgba(143,214,148,0.5)',
      tint: 'rgba(143,214,148,0.07)',
    },
  },
  gentle: {
    light: {
      accent: '#6a1b9a',
      ink: '#ffffff',
      soft: 'rgba(106,27,154,0.12)',
      glow: 'rgba(106,27,154,0.4)',
      tint: 'rgba(106,27,154,0.08)',
    },
    dark: {
      accent: '#c4a8f0',
      ink: '#1a0e2e',
      soft: 'rgba(196,168,240,0.16)',
      glow: 'rgba(196,168,240,0.5)',
      tint: 'rgba(196,168,240,0.07)',
    },
  },
  vitality: {
    light: {
      accent: '#5a7d00',
      ink: '#ffffff',
      soft: 'rgba(90,125,0,0.12)',
      glow: 'rgba(90,125,0,0.4)',
      tint: 'rgba(90,125,0,0.08)',
    },
    dark: {
      accent: '#d7ff5f',
      ink: '#15190a',
      soft: 'rgba(215,255,95,0.14)',
      glow: 'rgba(215,255,95,0.55)',
      tint: 'rgba(215,255,95,0.07)',
    },
  },
};

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

export interface AccentSwitcherLabels {
  group?: string;
  warmth?: string;
  serenity?: string;
  growth?: string;
  gentle?: string;
  vitality?: string;
}

const DEFAULT_ACCENT_LABELS: Required<AccentSwitcherLabels> = {
  group: 'Accent color',
  warmth: 'Warmth',
  serenity: 'Serenity',
  growth: 'Growth',
  gentle: 'Gentle',
  vitality: 'Vitality',
};

/** Meaning-based accent picker, rendered with the shared Select component. */
export function AccentSwitcher({ labels }: { labels?: AccentSwitcherLabels }) {
  const { accent, setAccent } = useAccent();
  const { resolved } = useTheme();
  const l = { ...DEFAULT_ACCENT_LABELS, ...labels };

  return (
    <label className="ui-inline-select" title={l.group}>
      <span aria-hidden="true">✦</span>
      <Select
        aria-label={l.group}
        value={accent}
        onChange={(event) => setAccent(event.target.value as Accent)}
        options={ACCENTS.map((a) => ({
          value: a,
          label: l[a],
          leading: (
            <span
              className="ui-color-swatch"
              style={{ background: ACCENT_PALETTES[a][resolved].accent }}
            />
          ),
        }))}
      />
    </label>
  );
}
