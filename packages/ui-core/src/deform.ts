import type { DeformEvent, DeformState, PortableComponent, Semantics } from '@ilovecode33/ui-types';


/**
 * Rubber-band resistance: maps an unresisted offset to
 * `value * max / (100 * max + |value|)`, preserving the sign. Returns 0 for a
 * non-positive `max`; the magnitude approaches `max` asymptotically.
 */
export function resist(value: number, max: number): number {
  if (max <= 0) return 0;
  return (value * max) / (100 * max + Math.abs(value));
}

/**
 * Elastic-drag state machine. `start` activates without moving; `move` resists
 * the pointer delta with `resist` (default `max` 8px, axis `both`), records the
 * unresisted `rawX`/`rawY`, and derives per-axis intensity plus overall progress
 * in [0, 1]. A suppressed axis yields zero delta and intensity for that axis;
 * `end` resets every field to its resting value.
 */
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

/**
 * Map a deformable surface to `{ role: 'group', label }`; the deformation itself
 * adds no ARIA state.
 */
export function deformSemantics(label?: string): Semantics {
  return { role: 'group', label };
}

/** Portable definition of `Deformable`: initial state, reducer, and role mapping. */
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
