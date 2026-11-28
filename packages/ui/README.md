# @ilovecode33/ui

React component and hook library for the UI family: the renderer layer over the shared token data and portable state contracts.

## Usage

```tsx
import { Button, ThemeSwitcher, UIFoundation } from '@ilovecode33/ui';

export function Settings() {
  return (
    <UIFoundation>
      <ThemeSwitcher />
      <Button variant="primary">Save changes</Button>
    </UIFoundation>
  );
}
```

`UIFoundation` loads the global token/base stylesheet internally, so wrapped apps do not import it separately. If you use a component without `UIFoundation`, import `@ilovecode33/ui/styles.css` yourself.

Inside this repository, add it as a workspace dependency (`bun add @ilovecode33/ui@workspace:*`); published consumers install `@ilovecode33/ui`. `react` and `react-dom` 19 are peer dependencies. Component styles are preserved in the transformed output and load with the component imports.

## Exports

`src/index.ts` re-exports two groups:

- `src/components/index.ts` — all public components, including `Button`, `Card`, `Stack`, `Row`, `Segmented`, `Switch`, `Select`, `Sheet`, `TabBar`, `PhotoGrid`, `PhotoViewer`, `Toast`, `UIFoundation`, `ThemeProvider`, `AccentProvider`, and the theme/accent switchers.
- `src/hooks/index.ts` — `useTheme`, `DEFAULT_THEME`, `useAccent`, `useLocale`, `useDeform`, `usePrefersReducedMotion`, and `useSelectionMode`.

Shared prop, state and event types are **not** re-exported by this package; import them from `@ilovecode33/ui-types`. All user-facing strings are passed via props with English defaults — the library does not depend on an i18n package.

## Relationship to the other ui-* packages

- `@ilovecode33/ui-tokens` owns the token values and generators. `src/styles.css` imports `@ilovecode33/ui-tokens/styles.css` and is emitted as `dist/styles.css` (tokens + base/reset). Rslib runs in bundleless mode, so each component keeps its CSS Module import in the output (`Button.module.js` → `Button_module.css`) and the consumer's bundler includes only the styles of the components it imports. There is no custom post-build script and no aggregate `index.css`.
- `@ilovecode33/ui-types` supplies the domain-grouped types consumed directly by components.
- `@ilovecode33/ui-core` supplies the framework-neutral reducers and portable contracts that these components render.
- All four packages share one version through the Changesets fixed group.

Public styling hooks are stable `data-ui` attribute slots defined in `styles.css`, so consumers can target them without a class-name mapper.

## Tests

Every component has a colocated `*.spec.tsx` and exactly one structural snapshot in `src/components/__snapshots__/`. Rstest runs the suite in `happy-dom`.

## Development

```sh
bunx turbo run typecheck build test --filter=@ilovecode33/ui
bunx turbo run dev --filter=@ilovecode33/ui
```

## Docs

- [Changelog](./CHANGELOG.md)
- [Repository README](../../README.md)
- [Releasing](../../RELEASING.md)
- [AI rules and component criteria](../../packages/ai-rules/README.md)
