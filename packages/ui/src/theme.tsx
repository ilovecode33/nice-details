import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type Theme = 'system' | 'light' | 'dark';
export const DEFAULT_THEME: Theme = 'system';

const STORAGE_KEY = 'gallery.theme';

interface ThemeValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
  /** The theme actually displayed (system is resolved to light/dark). */
  resolved: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeValue | null>(null);

function systemPrefersDark(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );
}

function readSaved(defaultTheme: Theme): Theme {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === 'light' || v === 'dark' || v === 'system') return v;
  } catch {
    /* storage unavailable */
  }
  return defaultTheme;
}

export function ThemeProvider({
  children,
  defaultTheme = DEFAULT_THEME,
}: {
  children: ReactNode;
  defaultTheme?: Theme;
}) {
  const [theme, setThemeState] = useState<Theme>(() => readSaved(defaultTheme));
  const [systemDark, setSystemDark] = useState(systemPrefersDark);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => setSystemDark(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const resolved: 'light' | 'dark' =
    theme === 'system' ? (systemDark ? 'dark' : 'light') : theme;

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  const value = useMemo<ThemeValue>(
    () => ({ theme, setTheme: setThemeState, resolved }),
    [theme, resolved],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within <ThemeProvider>');
  return ctx;
}

export interface ThemeSwitcherLabels {
  group?: string;
  system?: string;
  light?: string;
  dark?: string;
}

const DEFAULT_THEME_LABELS: Required<ThemeSwitcherLabels> = {
  group: 'Appearance',
  system: 'Follow system',
  light: 'Light',
  dark: 'Dark',
};

/** Three-state appearance picker: follow system / light / dark. Labels can be passed in for i18n. */
export function ThemeSwitcher({ labels }: { labels?: ThemeSwitcherLabels }) {
  const { theme, setTheme } = useTheme();
  const l = { ...DEFAULT_THEME_LABELS, ...labels };
  const options: Array<{ value: Theme; label: string; icon: string }> = [
    { value: 'system', label: l.system, icon: '◐' },
    { value: 'light', label: l.light, icon: '☀' },
    { value: 'dark', label: l.dark, icon: '☾' },
  ];

  return (
    <div className="ui-theme" role="group" aria-label={l.group} title={l.group}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          className={`ui-theme__option ${theme === o.value ? 'is-active' : ''}`}
          aria-pressed={theme === o.value}
          title={o.label}
          onClick={() => setTheme(o.value)}
        >
          <span aria-hidden="true">{o.icon}</span>
          <span className="ui-sr-only">{o.label}</span>
        </button>
      ))}
    </div>
  );
}
