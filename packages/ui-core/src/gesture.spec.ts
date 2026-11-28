import { describe, expect, test } from '@rstest/core';
import { createGestureMachine } from './gesture';

const point = (x: number, y: number) => ({ x, y });

const machine = createGestureMachine();
const down = (instant: boolean) =>
  machine.transition('idle', machine.createContext(), {
    type: 'down',
    pointerId: 1,
    point: point(10, 10),
    instant,
  });

describe('createGestureMachine', () => {
  test('mouse and pen arm immediately', () => {
    expect(down(true).state).toBe('armed');
  });

  test('touch presses wait for the hold', () => {
    const pressing = down(false);
    expect(pressing.state).toBe('pressing');
    expect(machine.transition('pressing', pressing.context, { type: 'hold' }).state).toBe(
      'armed',
    );
  });

  test('a swipe cancels an unheld press instead of dragging', () => {
    const pressing = down(false);
    const moved = machine.transition('pressing', pressing.context, {
      type: 'move',
      point: point(10, 22),
    });
    expect(moved.state).toBe('idle');
    expect(moved.context.origin).toBeNull();
  });

  test('small movement while pressing keeps waiting', () => {
    const pressing = down(false);
    const moved = machine.transition('pressing', pressing.context, {
      type: 'move',
      point: point(13, 12),
    });
    expect(moved.state).toBe('pressing');
    expect(moved.context.point).toEqual(point(13, 12));
  });

  test('armed movement starts a drag after the drag slop', () => {
    const armed = down(true);
    const small = machine.transition('armed', armed.context, {
      type: 'move',
      point: point(11, 11),
    });
    expect(small.state).toBe('armed');

    const dragging = machine.transition('armed', armed.context, {
      type: 'move',
      point: point(10, 20),
    });
    expect(dragging.state).toBe('dragging');
    expect(dragging.context.origin).toEqual(point(10, 10));
    expect(dragging.context.point).toEqual(point(10, 20));
  });

  test('dragging follows the pointer and ends on release or cancel', () => {
    const armed = down(true);
    const dragging = machine.transition('armed', armed.context, {
      type: 'move',
      point: point(10, 20),
    });
    const moved = machine.transition('dragging', dragging.context, {
      type: 'move',
      point: point(10, 30),
    });
    expect(moved.context.point).toEqual(point(10, 30));

    expect(machine.transition('dragging', moved.context, {
      type: 'up',
      point: point(10, 30),
    }).state).toBe('idle');
    expect(machine.transition('dragging', moved.context, { type: 'cancel' }).state).toBe(
      'idle',
    );
  });

  test('a release before the drag threshold stays a click', () => {
    const armed = down(true);
    const released = machine.transition('armed', armed.context, {
      type: 'up',
      point: point(10, 10),
    });
    expect(released.state).toBe('idle');
    expect(released.context.origin).toBeNull();
  });
});
