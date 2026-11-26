import type { ThemeSwitcherLabels } from '@ilovecode33/ui-types';
import styles from './ThemeSwitcher.module.css';
import { type ReactNode } from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { useSegmentPillDrag } from '../hooks/useSegmentPillDrag';
import type { Theme } from '@ilovecode33/ui-types';

const DEFAULT_THEME_LABELS: Required<ThemeSwitcherLabels> = {
  group: 'Appearance',
  system: 'Follow system',
  light: 'Light',
  dark: 'Dark',
};

// Stable order shared by the pill engine and the rendered options. Keeping the
// reference constant prevents the measurement effect from re-running each render.
const THEME_VALUES = ['system', 'light', 'dark'] as const;

// The theme pill is only 44px wide, so keep the snap/magnet zone small; the
// defaults tuned for ~100px segmented slots would cover most of the slot.
const THEME_PILL_FEEL = {
  slotRadius: 14,
  deadZone: 3,
  breakaway: 10,
  magnetStrength: 0.2,
} as const;

/**
 * Three-option appearance picker (system / light / dark) with `aria-pressed`
 * synced to the current theme. A sliding pill reuses the same drag engine as
 * `Segmented` (`useSegmentPillDrag`), so the appearance control feels identical:
 * heavy breakaway, damped follow, and a re-based settle with no boundary
 * rebound. Labels default to English and can be passed via `labels`.
 */
export function ThemeSwitcher({ labels }: { labels?: ThemeSwitcherLabels }) {
  const { theme, setTheme } = useTheme();
  const l = { ...DEFAULT_THEME_LABELS, ...labels };
  const options: Array<{ value: Theme; label: string; icon: ReactNode }> = [
    { value: 'system', label: l.system, icon: <Monitor /> },
    { value: 'light', label: l.light, icon: <Sun /> },
    { value: 'dark', label: l.dark, icon: <Moon /> },
  ];
  const {
    trackRef,
    thumbRef,
    shiftRef,
    slots,
    activeIndex,
    dragging,
    settling,
    hoveredIndex,
    setHoveredIndex,
    handlers,
    thumbStyle,
    shiftStyle,
  } = useSegmentPillDrag({
    values: THEME_VALUES,
    value: theme,
    onChange: (next) => setTheme(next),
    feel: THEME_PILL_FEEL,
  });

  const hovered = hoveredIndex === activeIndex;
  const dataUi = dragging
    ? 'theme__thumb theme__thumb--dragging'
    : settling
      ? 'theme__thumb theme__thumb--settling'
      : 'theme__thumb';

  return (
    <div
      ref={trackRef}
      className={styles['ui-theme']}
      role="group"
      aria-label={l.group}
      title={l.group}
      {...handlers}
    >
      {slots && (
        <div ref={thumbRef} className={styles['ui-theme__thumb']} data-ui={dataUi} style={thumbStyle}>
          <div
            ref={shiftRef}
            className={[styles['ui-theme__thumb-shift'], styles[hovered ? 'is-hovered' : ''] || ''].filter(Boolean).join(' ')}
            data-ui="theme__thumb-shift"
            style={shiftStyle}
          />
        </div>
      )}
      {options.map((o, index) => (
        <button
          key={o.value}
          type="button"
          data-index={index}
          className={[styles['ui-theme__option'], styles[theme === o.value ? 'is-active' : ''] || ''].filter(Boolean).join(' ')}
          aria-pressed={theme === o.value}
          title={o.label}
          onPointerEnter={() => setHoveredIndex(index)}
          onPointerLeave={() => setHoveredIndex(null)}
          onClick={() => setTheme(o.value)}
        >
          <span aria-hidden="true">{o.icon}</span>
          <span className={'ui-sr-only'}>{o.label}</span>
        </button>
      ))}
    </div>
  );
}
