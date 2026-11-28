# Changelog

## 0.5.1

### Patch Changes

- @ilovecode33/ui-types@0.5.1

## 0.5.0

### Patch Changes

- @ilovecode33/ui-types@0.5.0

## 0.4.0

### Minor Changes

- 95ae1f6: Add `@ilovecode33/state-machine`, a minimal typed state machine (states, events, guards, actions; no interpreter, timers, or runtime dependencies), and move press handling onto it. `ui-core` exposes `createGestureMachine` (`idle → pressing → armed → dragging`) with long-press and scroll-handoff guards; `useDeform`/`Deformable` drive it from pointer events and report `onGesture` snapshots. `Select` and `Switch` consume those snapshots instead of keeping their own long-press timers, document listeners, pointer capture, and click suppression. The Switch arms after 250ms (the Select keeps 450ms), and `Field` captions no longer activate a Select or Switch inside them when clicked.

### Patch Changes

- 95ae1f6: Build the remaining workspace libraries in bundleless (transform) mode so per-module imports are preserved. Photo wall no longer exposes a separate `styles.css` subpath; its component CSS Modules ship with the component imports.
- Updated dependencies [95ae1f6]
- Updated dependencies [95ae1f6]
  - @ilovecode33/ui-types@0.4.0
  - @ilovecode33/state-machine@0.1.0

## 0.3.2

### Patch Changes

- 73ae073: Refresh README.md for every workspace with concise, current summaries and verified documentation links.
- Updated dependencies [73ae073]
  - @ilovecode33/ui-types@0.3.2

## 0.3.1

### Patch Changes

- @ilovecode33/ui-types@0.3.1

All notable changes to `@ilovecode33/ui-core` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0] - 2026-11-26

### Added

- Rstest coverage for the framework-neutral contracts: deformation, floating
  and toggle reducers each have a spec, with a Node-only `rstest.config.ts` and
  a `test` script.
- JSDoc for the public contracts and helpers. The rubber-band resistance curve
  and the gesture/selection state fields now state their inputs, outputs and
  non-obvious invariants explicitly.

### Changed

- Portable contract state, event and prop types now come from
  `@ilovecode33/ui-types` instead of the package's local `types.ts`; the local
  type module was removed from the public entry point.
- The package ships at `0.3.0`, matching the rest of the UI family so all
  `@ilovecode33/ui*` packages can be upgraded as one unit.
