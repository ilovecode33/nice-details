import { createMachine, type Machine } from '@ilovecode33/state-machine';
import type { GesturePhase, GesturePoint } from '@ilovecode33/ui-types';

export interface GestureContext {
  pointerId: number | null;
  origin: GesturePoint | null;
  point: GesturePoint | null;
}

export type GestureEvent =
  | {
      type: 'down';
      pointerId: number;
      point: GesturePoint;
      /** Mouse and pen arm immediately; touch waits for a long press. */
      instant: boolean;
    }
  | { type: 'hold' }
  | { type: 'move'; point: GesturePoint }
  | { type: 'up'; point: GesturePoint }
  | { type: 'cancel' };

export interface GestureOptions {
  /** Movement that cancels an unarmed press, handing the gesture to the page. */
  cancelSlop?: number;
  /** Movement that starts a drag once the press is armed. */
  dragSlop?: number;
}

export const DEFAULT_CANCEL_SLOP = 8;
export const DEFAULT_DRAG_SLOP = 4;

export type GestureMachine = Machine<GesturePhase, GestureContext, GestureEvent>;

const IDLE: GestureContext = { pointerId: null, origin: null, point: null };

function distance(context: GestureContext, point: GesturePoint): number {
  if (!context.origin) return 0;
  return Math.hypot(
    point.x - context.origin.x,
    point.y - context.origin.y,
  );
}

/**
 * Press lifecycle shared by deform feedback and drag gestures:
 *
 *   idle → (down) → pressing → (hold) → armed → (move) → dragging → (up) → idle
 *
 * A move past `cancelSlop` while `pressing` returns to idle so the browser can
 * scroll; `pressing` only exists for touch presses that need a long hold.
 * Mouse input passes `instant: true` and skips it.
 */
export function createGestureMachine({
  cancelSlop = DEFAULT_CANCEL_SLOP,
  dragSlop = DEFAULT_DRAG_SLOP,
}: GestureOptions = {}): GestureMachine {
  const start = (context: GestureContext, event: Extract<GestureEvent, { type: 'down' }>): GestureContext => ({
    pointerId: event.pointerId,
    origin: event.point,
    point: event.point,
  });

  const track = (
    context: GestureContext,
    event: Extract<GestureEvent, { type: 'move' }>,
  ): GestureContext => ({ ...context, point: event.point });

  return createMachine<GesturePhase, GestureContext, GestureEvent>({
    initial: 'idle',
    context: IDLE,
    states: {
      idle: {
        on: {
          down: [
            { guard: (_, event) => event.instant, target: 'armed', action: start },
            { target: 'pressing', action: start },
          ],
        },
      },
      pressing: {
        on: {
          hold: { target: 'armed' },
          move: [
            {
              guard: (context, event) => distance(context, event.point) > cancelSlop,
              target: 'idle',
              action: () => IDLE,
            },
            { action: track },
          ],
          up: { target: 'idle', action: () => IDLE },
          cancel: { target: 'idle', action: () => IDLE },
        },
      },
      armed: {
        on: {
          move: [
            {
              guard: (context, event) => distance(context, event.point) > dragSlop,
              target: 'dragging',
              action: track,
            },
            { action: track },
          ],
          up: { target: 'idle', action: () => IDLE },
          cancel: { target: 'idle', action: () => IDLE },
        },
      },
      dragging: {
        on: {
          move: { action: track },
          up: { target: 'idle', action: () => IDLE },
          cancel: { target: 'idle', action: () => IDLE },
        },
      },
    },
  });
}
