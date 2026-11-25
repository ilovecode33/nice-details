import type {
  DeformAxis,
  DeformEvent,
  DeformState,
  PortableComponent,
  Semantics,
} from '@ilovecode33/ui-types';


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
