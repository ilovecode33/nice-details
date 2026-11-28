---
'@ilovecode33/state-machine': minor
'@ilovecode33/ui': minor
'@ilovecode33/ui-core': minor
'@ilovecode33/ui-types': minor
---

Add `@ilovecode33/state-machine`, a minimal typed state machine (states, events, guards, actions; no interpreter, timers, or runtime dependencies), and move press handling onto it. `ui-core` exposes `createGestureMachine` (`idle → pressing → armed → dragging`) with long-press and scroll-handoff guards; `useDeform`/`Deformable` drive it from pointer events and report `onGesture` snapshots. `Select` and `Switch` consume those snapshots instead of keeping their own long-press timers, document listeners, pointer capture, and click suppression. The Switch arms after 250ms (the Select keeps 450ms), and `Field` captions no longer activate a Select or Switch inside them when clicked.
