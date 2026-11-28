import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react';

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

export interface DeformOptions {
  /** Resistance limit in px. Farther drags approach it asymptotically. */
  max?: number;
  /** Which axis responds to the drag. */
  axis?: DeformAxis;
  /** Set false to disable gesture feedback. */
  enabled?: boolean;
  /** Override `touch-action`; by axis: x → pan-y, y → pan-x, both → none. */
  touchAction?: CSSProperties['touchAction'];
  /**
   * Touch press (ms) that arms drag feedback. Until it elapses, movement
   * scrolls the page and never deforms the control. Mouse input is immediate.
   */
  longPressMs?: number;
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
