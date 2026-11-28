# Frontend project conventions

Scope: every frontend app in `apps/*` and every package that renders UI
(`packages/ui`, `packages/ui-core`, `packages/photo-wall`). Framework-neutral
packages such as `packages/okr-shared` keep their own test conventions.

The shared design system in `@ilovecode33/ui` and `@ilovecode33/ui-tokens` is
the only owner of global CSS.

## 1. CSS Modules only

- Every component's styles live in a CSS Module imported by that component:
  `import styles from './Component.module.css'`. Apply classes through the
  imported map (`styles.root`), never through string class names.
- Do not add app-level global stylesheets (`styles.css`, `app.css`,
  `globals.css`, ...) and do not import one from the entry. Wrap the app in
  `UIFoundation`; it loads the shared `@ilovecode33/ui/styles.css` (tokens +
  base) internally, and component styles travel with the component imports.
  Import `styles.css` explicitly only when using components without
  `UIFoundation`.
- Do not use `:global(...)` for app or component layout. Global selectors are
  reserved for the design system (`packages/ui`, `packages/ui-tokens`).
- Shared UI libraries build in bundleless (transform) mode so component CSS
  Module imports stay attached to the component. Do not reintroduce an
  aggregate component stylesheet.
- Prefer element selectors scoped under a module class (`.root h1 { ... }`)
  over global element rules.
- A component must not import another component's module or target its hashed
  class names. Small repeated primitives (a field label, input sizing) are
  duplicated in the owning module rather than reaching across ownership.
- Public cross-component hooks, when genuinely needed, use stable `data-*`
  attributes (for example the `data-ui` slots from `@ilovecode33/ui`), not
  module class names.
- All values come from `@ilovecode33/ui-tokens` custom properties; see
  [mobile-first.md](mobile-first.md) and
  [design-principles.md](design-principles.md). Phone base first; desktop
  refinements only in `@media (min-width: 768px)`.

## 2. Same-name component, style, test

Each component owns one name and one directory:

```
Component.tsx
Component.module.css
Component.spec.tsx
```

- **Same base name.** The component, its stylesheet, and its spec use exactly
  the same name, differing only by extension. Do not create `card.styles.css`,
  `components.css`, `helpers.css`, `App.css`, or a spec named after a feature.
- **Colocated.** Keep the trio together: `src/App.*` for the root component and
  `src/components/<Name>.*` for every other component. No global `styles/` or
  `__tests__/` folders.
- **One component per trio.** Extract a non-trivial child into its own trio
  (`KeyResultRow.tsx`, `KeyResultRow.module.css`, `KeyResultRow.spec.tsx`)
  instead of hiding it in the parent. A tiny private render helper may stay in
  the parent file, but it must use the parent's module and be covered by the
  parent's spec.
- **Every component has a spec.** At minimum it renders, exposes its accessible
  name/role, and covers its main interaction and error path. Tests use Rstest
  with Testing Library (`*.spec.tsx`) and live next to the component.
- **No orphan files.** Every `*.module.css` and `*.spec.tsx` belongs to a
  component with the same base name. Delete styles and tests when their
  component is removed.

## 3. Checklist

- [ ] No app-level global CSS; the entry imports only the shared design system.
- [ ] Every styled component imports its own `Name.module.css`.
- [ ] `Name.tsx`, `Name.module.css`, and `Name.spec.tsx` share one base name and
      one directory.
- [ ] No component imports another component's module.
- [ ] No `:global(...)` for app layout.
- [ ] `bunx turbo run typecheck build test` is green.
