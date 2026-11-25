import styles from './AccentSwitcher.module.css';
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
import { useAccent } from './AccentProvider';
import { useTheme } from './ThemeProvider';


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
    <label className={styles['ui-inline-select']} title={l.group}>
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
              className={styles['ui-color-swatch']}
              style={{ background: ACCENT_PALETTES[a][resolved].accent }}
            />
          ),
        }))}
      />
    </label>
  );
}