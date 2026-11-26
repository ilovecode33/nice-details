# Photo wall

Scope: Applies to the `@ilovecode33/photo-wall` library.

`@ilovecode33/photo-wall` is a React photo-wall component plus the pure layout
algorithms behind it. It is React-specific but contains no app-specific logic.

## File granularity and colocation

- The component lives in `src/components/PhotoWall.tsx`, next to its
  `PhotoWall.module.css` and `PhotoWall.spec.tsx`; all three are named after the
  component.
- Layout math is split into single-purpose algorithm modules at `src/`:
  `geometry.ts`, `light.ts`, `tiles.ts`, and `params.ts`. Each module's behavior
  has a colocated `<module>.spec.ts` (for example `geometry.spec.ts`,
  `light.spec.ts`, `tiles.spec.ts`). Add a new algorithm as its own module with
  its own colocated spec, not as a branch inside an existing one.
- The component's structural snapshot lives at
  `src/components/__snapshots__/PhotoWall.spec.tsx.snap` and is produced by the
  shared helper in `src/test-utils/snapshot.ts` (`expectComponentSnapshot`).
  Never hand-edit a `.snap` file; regenerate deliberately.
- Shared test helpers belong in `src/test-utils/`.

## Unit tests and snapshots

- Every component and algorithm module has a colocated spec.
- `PhotoWall.spec.tsx` includes a `matches its structural snapshot` case that
  calls `expectComponentSnapshot(...)`. The helper normalizes React-generated
  ids to `ID` and clears persisted state (`localStorage`, `data-theme`,
  `data-accent`, `lang`, inline styles) before capturing, so a snapshot changes
  only when markup changes.
- Snapshots capture structure only: tags, roles, ARIA, `data-*` slots, and CSS
  Module classes.
- Fixtures are deterministic: fix `seed`, `viewportAspect`, and a static
  `images` array. No timers, fake clocks, randomness, `Date.now()`, or network
  access — the same input must produce the same tiles and geometry.
- Rstest runs in `happy-dom` with `setupFiles: ['./rstest.setup.ts']`, which
  registers jest-dom matchers and cleans up rendered React trees after each
  test.

## Public API and type ownership

- `src/index.ts` is the only public entry: it exports the `PhotoWall` component
  and the `params`, `tiles`, `geometry`, and `light` modules.
- Types are defined and owned locally in this package. Do not move them to
  `@ilovecode33/ui-types`; that rule applies only to `ui` and `ui-core`.
- Styles are a separate public subpath, `@ilovecode33/photo-wall/styles.css`
  (mapped to `dist/index.css`). Consumers import it explicitly; do not inject
  CSS from JavaScript.

## What not to put in the library

- No app-specific logic: no routing, data fetching, feature flags, or knowledge
  of any consuming app.

## Commands

- Test: `bunx turbo run test --filter=@ilovecode33/photo-wall` (runs `rstest run`).
- In the package: `bunx rstest run`; regenerate snapshots with
  `bunx rstest run -u` in `packages/photo-wall`.
- Check: `bunx turbo run typecheck build --filter=@ilovecode33/photo-wall`.

---

See also: [rule index](README.md), [`AGENTS.md`](../../AGENTS.md).
