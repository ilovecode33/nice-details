import classes from './ThemeSwitcher.module.css';
import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { createCn } from '../css';
import { useTheme, type Theme } from './ThemeProvider';

const cn = createCn(classes);

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
  const options: Array<{ value: Theme; label: string; icon: ReactNode }> = [
    { value: 'system', label: l.system, icon: <Monitor /> },
    { value: 'light', label: l.light, icon: <Sun /> },
    { value: 'dark', label: l.dark, icon: <Moon /> },
  ];

  return (
    <div className={cn('ui-theme')} role="group" aria-label={l.group} title={l.group}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          className={cn(`ui-theme__option ${theme === o.value ? 'is-active' : ''}`)}
          aria-pressed={theme === o.value}
          title={o.label}
          onClick={() => setTheme(o.value)}
        >
          <span aria-hidden="true">{o.icon}</span>
          <span className={cn('ui-sr-only')}>{o.label}</span>
        </button>
      ))}
    </div>
  );
}
