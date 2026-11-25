import type { CSSProperties, ReactNode } from 'react';

export interface MediaState {
  index: number;
  count: number;
}

export type MediaEvent =
  | { type: 'next' }
  | { type: 'previous' }
  | { type: 'goTo'; index: number };

function clamp(index: number, count: number): number {
  if (count <= 0) return 0;
  return Math.min(Math.max(index, 0), count - 1);
}

export interface SelectionModeState {
  active: boolean;
  selectedIds: readonly string[];
}

export type SelectionModeEvent =
  | { type: 'enter' }
  | { type: 'exit' }
  | { type: 'toggle'; id: string }
  | { type: 'clear' };

export interface PhotoItem {
  id: string;
  src?: string;
  alt: string;
  emoji?: ReactNode;
  style?: CSSProperties;
}
