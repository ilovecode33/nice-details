import type { Accent } from '@ilovecode33/ui-tokens';

export type Theme = 'system' | 'light' | 'dark';

export interface ThemeValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
  /** The theme actually displayed (system is resolved to light/dark). */
  resolved: 'light' | 'dark';
}

export interface AccentValue {
  accent: Accent;
  setAccent: (a: Accent) => void;
}

export interface ThemeSwitcherLabels {
  group?: string;
  system?: string;
  light?: string;
  dark?: string;
}

export interface AccentSwitcherLabels {
  group?: string;
  warmth?: string;
  serenity?: string;
  growth?: string;
  gentle?: string;
  vitality?: string;
}
