import { describe, expect, test } from '@rstest/core';
import { createMachine, type EventBase } from './index';

type State = 'idle' | 'running' | 'done';
type Event =
  | { type: 'start'; speed: number }
  | { type: 'tick' }
  | { type: 'finish' };

interface Context {
  speed: number;
  ticks: number;
}

function machine() {
  return createMachine<State, Context, Event>({
    initial: 'idle',
    context: () => ({ speed: 0, ticks: 0 }),
    states: {
      idle: {
        on: {
          start: {
            target: 'running',
            action: (context, event) => ({ ...context, speed: event.speed }),
          },
        },
      },
      running: {
        on: {
          tick: {
            guard: (context) => context.speed > 0,
            action: (context) => ({ ...context, ticks: context.ticks + 1 }),
          },
          finish: { target: 'done' },
        },
      },
    },
  });
}

describe('createMachine', () => {
  test('moves between states and updates context', () => {
    const m = machine();
    const started = m.transition('idle', m.createContext(), {
      type: 'start',
      speed: 2,
    });
    expect(started.state).toBe('running');
    expect(started.context.speed).toBe(2);

    const ticked = m.transition(started.state, started.context, { type: 'tick' });
    expect(ticked.state).toBe('running');
    expect(ticked.context.ticks).toBe(1);

    expect(m.transition(ticked.state, ticked.context, { type: 'finish' }).state).toBe(
      'done',
    );
  });

  test('leaves the context untouched when a guard fails', () => {
    const m = machine();
    const context = { speed: 0, ticks: 0 };
    const next = m.transition('running', context, { type: 'tick' });
    expect(next.state).toBe('running');
    expect(next.context).toBe(context);
  });

  test('tries guarded transitions in order', () => {
    type Phase = 'waiting' | 'small' | 'large';
    const m = createMachine<Phase, { value: number }, { type: 'set'; value: number }>({
      initial: 'waiting',
      context: { value: 0 },
      states: {
        waiting: {
          on: {
            set: [
              { guard: (_, event) => event.value > 10, target: 'large' },
              { target: 'small' },
            ],
          },
        },
      },
    });

    expect(m.transition('waiting', { value: 0 }, { type: 'set', value: 11 }).state).toBe(
      'large',
    );
    expect(m.transition('waiting', { value: 0 }, { type: 'set', value: 2 }).state).toBe(
      'small',
    );
  });

  test('ignores unknown events and states without handlers', () => {
    const m = machine();
    const context = { speed: 1, ticks: 0 };
    expect(m.transition('idle', context, { type: 'tick' })).toEqual({
      state: 'idle',
      context,
    });
    expect(m.transition('done', context, { type: 'start', speed: 3 })).toEqual({
      state: 'done',
      context,
    });
  });

  test('creates a fresh context per machine instance', () => {
    const first = machine();
    const second = machine();
    expect(first.createContext()).not.toBe(second.createContext());
  });
});
