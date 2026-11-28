/** Lifecycle of a pointer press, shared by gesture consumers and deform feedback. */
export type GesturePhase = 'idle' | 'pressing' | 'armed' | 'dragging';

export interface GesturePoint {
  x: number;
  y: number;
}

/** Snapshot sent to `onGesture` after every press, move, and release. */
export interface GestureSnapshot {
  phase: GesturePhase;
  previous: GesturePhase;
  pointerId: number | null;
  origin: GesturePoint | null;
  point: GesturePoint | null;
  /** Current point minus the press origin; zero when idle. */
  delta: GesturePoint;
  /** True when this snapshot ends a drag with a pointerup. */
  committed: boolean;
}
