import type { PortableComponent, Semantics } from './types';

/**
 * Elastic drag feedback. Raw pointer distance is pushed through a rubber-band
 * curve, so the farther the user drags the harder it gets and the surface
 * asymptotically approaches (but never exceeds) the resistance limit.
 *
 * The reducer stays framework-neutral: renderers map the intensities to CSS
 * transforms or SwiftUI effects using their own design tokens.
 */

export type DeformAxis = 'x' | 'y' | 'both';

export interface DeformState {
  active: boolean;
  /** Resisted offset in px. */
  dx: number;
  dy: number;
  /** Unresisted pointer delta, kept for hosts that need it. */
  rawX: number;
  rawY: number;
  /** 0 → 1 along each axis. */
  intensityX: number;
  intensityY: number;
  /** 0 → 1 overall. */
  progress: number;
}

export type DeformEvent =
  | { type: 'start' }
  | {
      type: 'move';
      dx: number;
      dy: number;
      max?: number;
      axis?: DeformAxis;
    }
  | { type: 'end' };

/** Extremely hard rubber-band: f(v) = v·max / (100·max + |v|). Larger coefficient = harder pull. */
export function resist(value: number, max: number): number {
  if (max <= 0) return 0;
  return (value * max) / (100 * max + Math.abs(value));
}

export function deformReducer(state: DeformState, event: DeformEvent): DeformState {
  switch (event.type) {
    case 'start':
      return { ...state, active: true };
    case 'move': {
      const max = event.max ?? 8;
      const axis = event.axis ?? 'both';
      const rawX = axis === 'y' ? 0 : event.dx;
      const rawY = axis === 'x' ? 0 : event.dy;
      const dx = resist(rawX, max);
      const dy = resist(rawY, max);
      return {
        active: true,
        dx,
        dy,
        rawX,
        rawY,
        intensityX: Math.abs(dx) / max,
        intensityY: Math.abs(dy) / max,
        progress: Math.min(1, Math.hypot(dx, dy) / max),
      };
    }
    case 'end':
      return {
        active: false,
        dx: 0,
        dy: 0,
        rawX: 0,
        rawY: 0,
        intensityX: 0,
        intensityY: 0,
        progress: 0,
      };
  }
}

export function deformSemantics(label?: string): Semantics {
  return { role: 'group', label };
}

export const deformContract: PortableComponent<DeformState, DeformEvent> = {
  name: 'Deformable',
  swiftUI: 'DragGesture + rubber-band + spring animation',
  initial: () => ({
    active: false,
    dx: 0,
    dy: 0,
    rawX: 0,
    rawY: 0,
    intensityX: 0,
    intensityY: 0,
    progress: 0,
  }),
  reduce: deformReducer,
  semantics: () => deformSemantics(),
};
