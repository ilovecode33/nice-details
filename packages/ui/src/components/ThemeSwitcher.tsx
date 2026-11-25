import type { ThemeSwitcherLabels } from '@ilovecode33/ui-types';
import styles from './ThemeSwitcher.module.css';
import { type ReactNode } from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import type { Theme } from '@ilovecode33/ui-types';

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
    <div className={styles['ui-theme']} role="group" aria-label={l.group} title={l.group}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          className={[styles['ui-theme__option'], styles[theme === o.value ? 'is-active' : ''] || ''].filter(Boolean).join(' ')}
          aria-pressed={theme === o.value}
          title={o.label}
          onClick={() => setTheme(o.value)}
        >
          <span aria-hidden="true">{o.icon}</span>
          <span className={'ui-sr-only'}>{o.label}</span>
        </button>
      ))}
    </div>
  );
}
