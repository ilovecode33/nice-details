export type EventBase = { type: string };

/** One possible transition for an event. */
export interface Transition<
  State extends string,
  Context,
  Event extends EventBase,
> {
  /** Next state. Omit to stay in the current state. */
  target?: State;
  /** Runs first; false skips this transition and tries the next one. */
  guard?: (context: Context, event: Event) => boolean;
  /** Returns the next context, or nothing to keep it unchanged. */
  action?: (context: Context, event: Event) => Context | void;
}

/** Transitions for each event type, or an ordered list to pick by guard. */
export type TransitionMap<State extends string, Context, Event extends EventBase> = {
  [Type in Event['type']]?:
    | Transition<State, Context, Extract<Event, { type: Type }>>
    | Array<Transition<State, Context, Extract<Event, { type: Type }>>>;
};

export interface StateConfig<State extends string, Context, Event extends EventBase> {
  on?: TransitionMap<State, Context, Event>;
}

export interface MachineConfig<
  State extends string,
  Context,
  Event extends EventBase,
> {
  initial: State;
  /** Initial context, or a factory so every machine instance gets its own. */
  context: Context | (() => Context);
  states: Partial<Record<State, StateConfig<State, Context, Event>>>;
}

export interface TransitionResult<State extends string, Context> {
  state: State;
  context: Context;
}

export interface Machine<
  State extends string,
  Context,
  Event extends EventBase,
> {
  readonly initial: State;
  /** Fresh context for a new machine instance. */
  createContext: () => Context;
  transition(state: State, context: Context, event: Event): TransitionResult<State, Context>;
}

/**
 * Builds a small, pure state machine: no interpreter, actors, or timers.
 * A caller keeps `{ state, context }`, sends events, and renders the result.
 *
 * Transitions are tried in order, so a list can express guards:
 *
 *   move: [
 *     { guard: (_, event) => event.point.x > 10, target: 'dragging' },
 *     { target: 'pressing' },
 *   ]
 */
export function createMachine<
  State extends string,
  Context,
  Event extends EventBase,
>(config: MachineConfig<State, Context, Event>): Machine<State, Context, Event> {
  const createContext = () =>
    typeof config.context === 'function'
      ? (config.context as () => Context)()
      : config.context;

  return {
    initial: config.initial,
    createContext,
    transition(state, context, event) {
      const handlers = config.states[state]?.on?.[event.type as Event['type']] as
        | Transition<State, Context, Event>
        | Array<Transition<State, Context, Event>>
        | undefined;
      if (!handlers) return { state, context };

      const candidates = Array.isArray(handlers) ? handlers : [handlers];
      for (const candidate of candidates) {
        if (candidate.guard && !candidate.guard(context, event)) continue;
        const next = candidate.action?.(context, event);
        return {
          state: candidate.target ?? state,
          context: next === undefined ? context : next,
        };
      }
      return { state, context };
    },
  };
}
