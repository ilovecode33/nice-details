import type { AccentSwitcherLabels } from '@ilovecode33/ui-types';

import { ACCENTS, ACCENT_PALETTES, type Accent } from '@ilovecode33/ui-tokens';
import { Select } from './Select';
import { useAccent } from '../hooks/useAccent';
import { useTheme } from '../hooks/useTheme';

const DEFAULT_ACCENT_LABELS: Required<AccentSwitcherLabels> = {
  group: 'Accent color',
  warmth: 'Warmth',
  serenity: 'Serenity',
  growth: 'Growth',
  gentle: 'Gentle',
  vitality: 'Vitality',
};

/**
 * Renders a Select for choosing an accent by meaning, bound to AccentProvider state.
 * Each option shows a swatch from the palette of the currently resolved theme.
 * All visible labels come from `labels`, with English defaults.
 */
export function AccentSwitcher({ labels }: { labels?: AccentSwitcherLabels }) {
  const { accent, setAccent } = useAccent();
  const { resolved } = useTheme();
  const l = { ...DEFAULT_ACCENT_LABELS, ...labels };

  return (
    <div data-ui="inline-select" title={l.group}>
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
              data-ui="color-swatch"
              style={{ background: ACCENT_PALETTES[a][resolved].accent }}
            />
          ),
        }))}
      />
    </div>
  );
}
