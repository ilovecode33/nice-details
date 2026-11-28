import { describe, expect, test } from '@rstest/core';
import { createSheetMachine, type SheetMachineEvent } from './sheet';

const machine = createSheetMachine();

function openSheet(reducedMotion = false) {
  return machine.transition('closed', machine.createContext(), {
    type: 'open',
    reducedMotion,
  });
}

describe('createSheetMachine', () => {
  test('opens into opening and settles into open on entered', () => {
    const opening = openSheet();
    expect(opening.state).toBe('opening');

    const opened = machine.transition(opening.state, opening.context, { type: 'entered' });
    expect(opened.state).toBe('open');
  });

  test('skips opening when reducedMotion is enabled', () => {
    const opened = openSheet(true);
    expect(opened.state).toBe('open');
  });

  test('clamps dragMove offset to [0, panelHeight]', () => {
    const dragging = machine.transition('open', machine.createContext(), {
      type: 'dragStart',
      startY: 100,
      startTime: 0,
      panelHeight: 400,
    });
    expect(dragging.state).toBe('dragging');

    const up = machine.transition(dragging.state, dragging.context, {
      type: 'dragMove',
      y: 40,
    });
    expect(up.context.offset).toBe(0);

    const pastBottom = machine.transition(dragging.state, dragging.context, {
      type: 'dragMove',
      y: 700,
    });
    expect(pastBottom.context.offset).toBe(400);
  });

  test('dismisses to closing when dragged past closeDistance and resets on exited', () => {
    const dragging = machine.transition('open', machine.createContext(), {
      type: 'dragStart',
      startY: 100,
      startTime: 0,
      panelHeight: 500,
    });
    const closing = machine.transition(dragging.state, dragging.context, {
      type: 'dragEnd',
      y: 230,
      time: 500,
    });
    expect(closing.state).toBe('closing');
    expect(closing.context.offset).toBe(130);

    const closed = machine.transition(closing.state, closing.context, { type: 'exited' });
    expect(closed.state).toBe('closed');
    expect(closed.context.offset).toBe(0);
  });

  test('dismisses on a fast downward flick past flickDistanceMin', () => {
    const dragging = machine.transition('open', machine.createContext(), {
      type: 'dragStart',
      startY: 100,
      startTime: 0,
      panelHeight: 500,
    });
    const closing = machine.transition(dragging.state, dragging.context, {
      type: 'dragEnd',
      y: 135,
      time: 30,
    });
    expect(closing.state).toBe('closing');
  });

  test('closes directly when dragged to full panelHeight or under reducedMotion', () => {
    const dragging = machine.transition('open', machine.createContext(), {
      type: 'dragStart',
      startY: 100,
      startTime: 0,
      panelHeight: 400,
    });

    const fullDrag = machine.transition(dragging.state, dragging.context, {
      type: 'dragEnd',
      y: 520,
      time: 500,
    });
    expect(fullDrag.state).toBe('closed');

    const reduced = machine.transition(dragging.state, dragging.context, {
      type: 'dragEnd',
      y: 240,
      time: 500,
      reducedMotion: true,
    });
    expect(reduced.state).toBe('closed');
  });

  test('snaps back via settling when below threshold and allows re-grab during settling', () => {
    const dragging = machine.transition('open', machine.createContext(), {
      type: 'dragStart',
      startY: 100,
      startTime: 0,
      panelHeight: 500,
    });
    const moved = machine.transition(dragging.state, dragging.context, {
      type: 'dragMove',
      y: 130,
    });
    const settling = machine.transition(moved.state, moved.context, {
      type: 'dragEnd',
      y: 130,
      time: 500,
    });
    expect(settling.state).toBe('settling');

    const regrabbed = machine.transition(settling.state, settling.context, {
      type: 'dragStart',
      startY: 120,
      startTime: 550,
      panelHeight: 500,
    });
    expect(regrabbed.state).toBe('dragging');

    const openAgain = machine.transition(settling.state, settling.context, { type: 'settled' });
    expect(openAgain.state).toBe('open');
  });

  test('returns directly to open when released at offset 0 or cancelled at offset 0', () => {
    const dragging = machine.transition('open', machine.createContext(), {
      type: 'dragStart',
      startY: 100,
      startTime: 0,
      panelHeight: 500,
    });
    expect(
      machine.transition(dragging.state, dragging.context, {
        type: 'dragEnd',
        y: 90,
        time: 200,
      }).state,
    ).toBe('open');
    expect(
      machine.transition(dragging.state, dragging.context, { type: 'dragCancel' }).state,
    ).toBe('open');
  });

  test('ignores drag events while closing', () => {
    const closing = machine.transition('open', machine.createContext(), { type: 'dismiss' });
    expect(closing.state).toBe('closing');

    const afterDragStart = machine.transition(closing.state, closing.context, {
      type: 'dragStart',
      startY: 100,
      startTime: 0,
      panelHeight: 400,
    });
    expect(afterDragStart.state).toBe('closing');
  });

  test('never re-enters opening from any interactive event once past opening', () => {
    const states = ['open', 'dragging', 'settling', 'closing'] as const;
    const events: SheetMachineEvent[] = [
      { type: 'open' },
      { type: 'entered' },
      { type: 'dragStart', startY: 100, startTime: 0, panelHeight: 400 },
      { type: 'dragMove', y: 150 },
      { type: 'dragEnd', y: 150, time: 500 },
      { type: 'dragCancel' },
      { type: 'settled' },
      { type: 'dismiss' },
      { type: 'exited' },
      { type: 'close' },
    ];

    for (const state of states) {
      for (const event of events) {
        const next = machine.transition(state, machine.createContext(), event);
        expect(next.state).not.toBe('opening');
      }
    }
  });
});
