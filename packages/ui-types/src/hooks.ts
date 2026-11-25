import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react';
import type { DeformAxis, DeformState } from '@ilovecode33/ui-core';
import type { Accent } from '@ilovecode33/ui-tokens';

/** Appearance preference: follow the OS, or force a mode. */
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

export interface LocaleValue {
  locale: string;
  setLocale: (locale: string) => void;
  t: (key: string) => string;
  dictionary: Record<string, string>;
}

export interface DeformOptions {
  /** Resistance limit in px. Farther drags approach it asymptotically. */
  max?: number;
  /** Which axis responds to the drag. */
  axis?: DeformAxis;
  /** Set false to disable gesture feedback. */
  enabled?: boolean;
  /** Override `touch-action`; by axis: x → pan-y, y → pan-x, both → none. */
  touchAction?: CSSProperties['touchAction'];
}

export interface DeformResult {
  handlers: {
    onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
    onPointerMove: (event: ReactPointerEvent<HTMLElement>) => void;
    onPointerUp: (event: ReactPointerEvent<HTMLElement>) => void;
    onPointerCancel: (event: ReactPointerEvent<HTMLElement>) => void;
  };
  /** Transform feedback plus the CSS variables that place the press glow. */
  style: CSSProperties;
  state: DeformState;
  /** Bump on every press. Pass to `PressGlow` to replay the highlight once. */
  pulse: number;
}
