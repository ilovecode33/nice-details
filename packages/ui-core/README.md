# @ilovecode33/ui-core

Framework-neutral reducers, semantics mapping and portable component contracts for the UI family, with no React or DOM dependency.

## Usage

```ts
import {
  PORTABLE_COMPONENTS,
  toggleContract,
  toggleReducer,
  toggleSemantics,
} from '@ilovecode33/ui-core';
import type { ToggleState } from '@ilovecode33/ui-types';

const next: ToggleState = toggleReducer({ checked: false }, { type: 'toggle' });
const semantics = toggleSemantics(next, 'Wi-Fi'); // role: 'switch', checked: true
const sameContract = PORTABLE_COMPONENTS.Switch; // identical to toggleContract
```

Inside this repository, add it as a workspace dependency (`bun add @ilovecode33/ui-core@workspace:*`). The package is ESM-only and its single entry point is `@ilovecode33/ui-core`.

## Exports

For each domain, the entry point exposes a reducer, a semantics mapper and a portable contract (`name`, `swiftUI`, `initial`, `reduce`, `semantics`):

- Toggles, selection, disclosure and sheets: `toggleContract`, `selectionContract`, `disclosureContract`, `sheetContract`.
- Fields, lists, feedback, media and navigation: `fieldContract`, `listContract`, `feedbackContract`, `mediaContract`, `selectionModeContract`, `navigationContract`.
- Floating surfaces and drag feedback: `floatingContract`, `deformContract`.

Press gestures use `createGestureMachine` from this package: `idle → pressing → armed → dragging`, with guards for long-press arming and scroll handoff. `@ilovecode33/ui` drives it from pointer events and reports phases through `onGesture`.

Helpers include `resist`, `createSelectionState`, `enabledIndexes`, `checkboxSemantics`, `radioSemantics`, `comboboxSemantics`, `optionSemantics` and `tabSemantics`. `PORTABLE_COMPONENTS` collects every contract keyed by its React component name.

## Relationship to the other ui-* packages

- `@ilovecode33/ui-types` is a direct dependency: all state, event and semantic types come from there, so no local type module is exported.
- `@ilovecode33/state-machine` provides the generic transition engine behind `createGestureMachine`.
- `@ilovecode33/ui` consumes these contracts as the React renderer; the `swiftUI` field records the intended native counterpart for other renderers.
- `@ilovecode33/ui-tokens` holds the corresponding design values; this package holds only behavior.
- All four packages share one version through the Changesets fixed group.

## Tests

Reducers and contracts have colocated specs (`deform.spec.ts`, `floating.spec.ts`, `toggle.spec.ts`). Rstest runs them in a Node-only environment; no DOM or React renderer is needed.

## Development

```sh
bunx turbo run typecheck build test --filter=@ilovecode33/ui-core
bunx turbo run dev --filter=@ilovecode33/ui-core
```

## Docs

- [Changelog](./CHANGELOG.md)
- [Repository README](../../README.md)
- [Releasing](../../RELEASING.md)
- [AI rules and component criteria](../../packages/ai-rules/README.md)
