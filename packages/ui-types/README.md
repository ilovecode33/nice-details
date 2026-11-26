# @ilovecode33/ui-types

Shared, framework-portable TypeScript types for the UI family, grouped by domain and consumed directly by the other ui-* packages.

## Usage

```ts
import type { ToggleState, ToggleEvent, Theme, PortableComponent } from '@ilovecode33/ui-types';

const initial: ToggleState = { checked: false, disabled: false };
const event: ToggleEvent = { type: 'toggle' };
const theme: Theme = 'system';
// Contracts are parameterized with the matching state and event types:
type SwitchContract = PortableComponent<ToggleState, ToggleEvent>;
```

Add it as a workspace dependency inside this repository (`bun add @ilovecode33/ui-types@workspace:*`). The package is ESM-only and type-only: the entry point re-exports type modules, so there is no runtime API to import.

## Exports

`src/index.ts` re-exports one module per domain:

- Semantics and foundation: `Semantics`, `UiRole`, `PortableComponent`, `UIFoundationProps`, `LocaleValue`.
- Appearance: `Theme`, `ThemeValue`, `AccentValue`, `ThemeSwitcherLabels`, `AccentSwitcherLabels`.
- Behavior domains: `toggle`, `selection`, `disclosure`, `list`, `sheet`, `field`, `feedback`, `media`, `navigation`, `floating` and `deform`, each with state and event types (for example `ToggleState`, `DeformResult`, `SelectProps`).
- Primitives: `ButtonProps`, `CardProps` and related native-attribute extensions.

## Relationship to the other ui-* packages

- `@ilovecode33/ui-tokens` is a dependency: the `Accent` union used by theme contracts is defined there.
- `@ilovecode33/ui-core` is the main consumer: its reducers and contracts are typed with these state and event types.
- `@ilovecode33/ui` imports these types directly for component props and hooks; it does **not** re-export them, so consumers import from `@ilovecode33/ui-types`.
- All four packages share one version through the Changesets fixed group.

React attribute types are referenced for prop definitions via `@types/react`, but the package has no runtime React dependency and no i18n dependency.

## Tests

There is no test script or spec suite in this workspace; type safety is verified by the typecheck task.

## Development

```sh
bunx turbo run typecheck build test --filter=@ilovecode33/ui-types
```

The `test` task is currently a no-op here because the package has no `test` script; use `bunx turbo run typecheck build --filter=@ilovecode33/ui-types` to run only defined tasks.

## Docs

- [Changelog](./CHANGELOG.md)
- [Repository README](../../README.md)
- [Releasing](../../RELEASING.md)
- [AI rules and component criteria](../../packages/ai-rules/README.md)
