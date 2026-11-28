import { createMachine, type Machine } from '@ilovecode33/state-machine';
import type {
  PortableComponent,
  Semantics,
  SheetEvent,
  SheetPhase,
  SheetState,
} from '@ilovecode33/ui-types';

/** Set `presented` from `open` or `dismiss`; the state holds only that flag. */
export function sheetReducer(state: SheetState, event: SheetEvent): SheetState {
  switch (event.type) {
    case 'open':
      return { presented: true };
    case 'dismiss':
      return { presented: false };
  }
}

/**
 * Map sheet state to `{ role: 'dialog', label, modal: presented }` so the modal
 * attribute mirrors whether the sheet is presented.
 */
export function sheetSemantics(state: SheetState, label?: string): Semantics {
  return { role: 'dialog', label, modal: state.presented };
}

/** Portable definition of `Sheet`: initial state, reducer, and role mapping. */
export const sheetContract: PortableComponent<SheetState, SheetEvent> = {
  name: 'Sheet',
  swiftUI: '.sheet with detents',
  initial: () => ({ presented: false }),
  reduce: sheetReducer,
  semantics: (state) => sheetSemantics(state),
};

export interface SheetMachineContext {
  panelHeight: number;
  startY: number;
  startTime: number;
  offset: number;
}

export type SheetMachineEvent =
  | { type: 'open'; reducedMotion?: boolean }
  | { type: 'entered' }
  | { type: 'dragStart'; startY: number; startTime: number; panelHeight: number }
  | { type: 'dragMove'; y: number }
  | { type: 'dragEnd'; y: number; time: number; reducedMotion?: boolean }
  | { type: 'dragCancel'; reducedMotion?: boolean }
  | { type: 'settled' }
  | { type: 'dismiss'; reducedMotion?: boolean }
  | { type: 'exited' }
  | { type: 'close' };

export interface SheetMachineOptions {
  closeDistanceMin?: number;
  closeDistanceMax?: number;
  closeDistanceRatio?: number;
  flickDistanceMin?: number;
  flickVelocity?: number;
}

export const DEFAULT_SHEET_CLOSE_DISTANCE_MIN = 96;
export const DEFAULT_SHEET_CLOSE_DISTANCE_MAX = 160;
export const DEFAULT_SHEET_CLOSE_DISTANCE_RATIO = 0.22;
export const DEFAULT_SHEET_FLICK_DISTANCE_MIN = 24;
export const DEFAULT_SHEET_FLICK_VELOCITY = 0.65;

export type SheetMachine = Machine<SheetPhase, SheetMachineContext, SheetMachineEvent>;

const IDLE_CONTEXT: SheetMachineContext = {
  panelHeight: 0,
  startY: 0,
  startTime: 0,
  offset: 0,
};

function clampOffset(distance: number, panelHeight: number): number {
  if (distance <= 0) return 0;
  return panelHeight > 0 ? Math.min(distance, panelHeight) : distance;
}

/**
 * Modal sheet lifecycle and drag-to-dismiss state machine:
 *
 *   closed → (open) → opening → (entered) → open ⇄ dragging → settling / closing → closed
 *
 * Separating `opening` as a one-shot phase ensures the entrance animation never
 * replays when releasing a drag.
 */
export function createSheetMachine({
  closeDistanceMin = DEFAULT_SHEET_CLOSE_DISTANCE_MIN,
  closeDistanceMax = DEFAULT_SHEET_CLOSE_DISTANCE_MAX,
  closeDistanceRatio = DEFAULT_SHEET_CLOSE_DISTANCE_RATIO,
  flickDistanceMin = DEFAULT_SHEET_FLICK_DISTANCE_MIN,
  flickVelocity = DEFAULT_SHEET_FLICK_VELOCITY,
}: SheetMachineOptions = {}): SheetMachine {
  const startDrag = (
    _: SheetMachineContext,
    event: Extract<SheetMachineEvent, { type: 'dragStart' }>,
  ): SheetMachineContext => ({
    panelHeight: event.panelHeight,
    startY: event.startY,
    startTime: event.startTime,
    offset: 0,
  });

  const shouldDismiss = (context: SheetMachineContext, y: number, time: number): boolean => {
    const distance = Math.max(0, y - context.startY);
    const elapsed = Math.max(1, time - context.startTime);
    const velocity = distance / elapsed;
    const closeDistance = Math.min(
      closeDistanceMax,
      Math.max(closeDistanceMin, context.panelHeight * closeDistanceRatio),
    );
    return (
      distance >= closeDistance ||
      (distance >= flickDistanceMin && velocity >= flickVelocity)
    );
  };

  return createMachine<SheetPhase, SheetMachineContext, SheetMachineEvent>({
    initial: 'closed',
    context: IDLE_CONTEXT,
    states: {
      closed: {
        on: {
          open: [
            {
              guard: (_, event) => Boolean(event.reducedMotion),
              target: 'open',
              action: () => IDLE_CONTEXT,
            },
            { target: 'opening', action: () => IDLE_CONTEXT },
          ],
        },
      },
      opening: {
        on: {
          entered: { target: 'open' },
          dragStart: { target: 'dragging', action: startDrag },
          dismiss: [
            {
              guard: (_, event) => Boolean(event.reducedMotion),
              target: 'closed',
              action: () => IDLE_CONTEXT,
            },
            { target: 'closing' },
          ],
          close: { target: 'closed', action: () => IDLE_CONTEXT },
        },
      },
      open: {
        on: {
          dragStart: { target: 'dragging', action: startDrag },
          dismiss: [
            {
              guard: (_, event) => Boolean(event.reducedMotion),
              target: 'closed',
              action: () => IDLE_CONTEXT,
            },
            { target: 'closing' },
          ],
          close: { target: 'closed', action: () => IDLE_CONTEXT },
        },
      },
      dragging: {
        on: {
          dragMove: {
            action: (context, event) => ({
              ...context,
              offset: clampOffset(event.y - context.startY, context.panelHeight),
            }),
          },
          dragEnd: [
            {
              guard: (context, event) =>
                shouldDismiss(context, event.y, event.time) &&
                (Boolean(event.reducedMotion) ||
                  (context.panelHeight > 0 &&
                    clampOffset(event.y - context.startY, context.panelHeight) >=
                      context.panelHeight)),
              target: 'closed',
              action: () => IDLE_CONTEXT,
            },
            {
              guard: (context, event) => shouldDismiss(context, event.y, event.time),
              target: 'closing',
              action: (context, event) => ({
                ...context,
                offset: clampOffset(event.y - context.startY, context.panelHeight),
              }),
            },
            {
              guard: (context, event) =>
                Boolean(event.reducedMotion) ||
                clampOffset(event.y - context.startY, context.panelHeight) <= 0,
              target: 'open',
              action: () => IDLE_CONTEXT,
            },
            { target: 'settling', action: () => IDLE_CONTEXT },
          ],
          dragCancel: [
            {
              guard: (context, event) => Boolean(event.reducedMotion) || context.offset <= 0,
              target: 'open',
              action: () => IDLE_CONTEXT,
            },
            { target: 'settling', action: () => IDLE_CONTEXT },
          ],
          close: { target: 'closed', action: () => IDLE_CONTEXT },
        },
      },
      settling: {
        on: {
          settled: { target: 'open', action: () => IDLE_CONTEXT },
          dragStart: { target: 'dragging', action: startDrag },
          dismiss: [
            {
              guard: (_, event) => Boolean(event.reducedMotion),
              target: 'closed',
              action: () => IDLE_CONTEXT,
            },
            { target: 'closing' },
          ],
          close: { target: 'closed', action: () => IDLE_CONTEXT },
        },
      },
      closing: {
        on: {
          exited: { target: 'closed', action: () => IDLE_CONTEXT },
          close: { target: 'closed', action: () => IDLE_CONTEXT },
        },
      },
    },
  });
}
