# @ilovecode33/state-machine

A tiny, dependency-free state machine: typed states, events, guards, and actions. There is no
interpreter, actor system, timers, or framework binding — the caller keeps `{ state, context }` and
sends events.

## Usage

```ts
import { createMachine } from "@ilovecode33/state-machine";

type State = "idle" | "running" | "done";

const machine = createMachine<State, { ticks: number }, { type: "start" } | { type: "tick" }>({
  initial: "idle",
  context: () => ({ ticks: 0 }),
  states: {
    idle: { on: { start: { target: "running" } } },
    running: {
      on: {
        tick: { action: (context) => ({ ticks: context.ticks + 1 }) },
      },
    },
  },
});

const started = machine.transition(machine.initial, machine.createContext(), {
  type: "start",
});
```

## Rules

- Transitions are matched by event `type`. An array is evaluated in order, so guards express
  alternatives.
- `guard` returning false skips the transition; if none match, the state and context are unchanged.
- `action` returns the next context, or nothing to keep it.
- Omit `target` to stay in the current state while still updating context.
- Every call to `transition` is pure: no listeners, timers, or side effects. Effects belong to the
  caller.

## Tests

```sh
bunx turbo run test --filter=@ilovecode33/state-machine
```
