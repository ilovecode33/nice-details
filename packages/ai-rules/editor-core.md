# Editor core

Scope: Applies to the `@ilovecode33/editor-core` library.

`@ilovecode33/editor-core` is a framework-agnostic Lexical SDK. Its public API
is the `createEditor` controller; it has no React components and no CSS.

## Structure and type ownership

- No React components and no CSS: the package has no `src/components/`
  directory, no `.css` files, and exports no styles.
- `src/editor.ts` implements `createEditor`; its contract tests live in the
  colocated `src/editor.spec.ts`.
- Types are owned locally in `src/types.ts` and re-exported from `src/index.ts`.
  The `@ilovecode33/ui-types` rule applies only to `ui` and `ui-core`, not to
  this SDK — do not move these types into `ui-types`.
- `src/index.ts` is the only public entry: it exports `createEditor` and the
  editor types (`EditorController`, `EditorOptions`, `EditorSnapshot`,
  `EditorState`, `HeadingLevel`).

## Tests

- Colocated spec rule: every source module is covered by a `<module>.spec.ts`
  next to it (`editor.ts` → `editor.spec.ts`).
- Rstest uses `testEnvironment: 'happy-dom'` because Lexical needs a DOM. There
  is no React renderer and no CSS Modules adapter; the config has no setup
  files.
- Tests are deterministic: no timers, fake clocks, randomness, or real time;
  assert against fixed inputs so results are stable across runs.
- The public `createEditor` contract is exercised through the controller API
  `getHTML()`, `getText()`, `getState()`, and `isReadonly()`. Cover seeding from
  `initialHTML` (including HTML content such as bold) and `readonly` mode
  (including `aria-readonly` and host-supplied content via `setHTML`), as well
  as the default empty document and `onChange` snapshots.
- Every mounted controller is destroyed and every host element is removed in
  `afterEach`, so no listeners or DOM nodes leak between cases.
- `typecheck` passes with `tsc --noEmit`.

## Commands

- Test: `bunx turbo run test --filter=@ilovecode33/editor-core` (runs `rstest run`).
- In the package: `bunx rstest run`.
- Check: `bunx turbo run typecheck build --filter=@ilovecode33/editor-core`.

---

See also: [rule index](README.md), [`AGENTS.md`](../../AGENTS.md).
