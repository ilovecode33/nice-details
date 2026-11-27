# @ilovecode33/okr-web

A small, personal OKR tracker that runs entirely in the browser. There is no
backend, account, or network request: objectives and key results are stored in
IndexedDB through `@ilovecode33/persistence` and loaded again on the next visit.

## Run locally

```sh
bunx turbo run dev --filter=@ilovecode33/okr-web...
```

The trailing `...` includes the workspace libraries: Turbo builds them once
(`dependsOn: ["^build"]`) and then keeps their `build --watch` tasks running
alongside the app. Then open http://localhost:3201.

Run the component specs with:

```sh
bunx turbo run test --filter=@ilovecode33/okr-web
```

## Structure

Every component keeps its implementation, CSS Module, and spec together with the
same base name, per
[`frontend-project.md`](../../packages/ai-rules/frontend-project.md):

- `src/App.tsx`, `src/App.module.css`, `src/App.spec.tsx`
- `src/components/ObjectiveCard.tsx`, `.module.css`, `.spec.tsx`
- `src/components/ObjectiveEditor.tsx`, `.module.css`, `.spec.tsx`
- `src/components/KeyResultRow.tsx`, `.module.css`, `.spec.tsx`
- `src/storage.ts` / `src/storage.spec.ts` — the IndexedDB adapter

There is no app-level global stylesheet and no manual UI stylesheet import:
`UIFoundation` loads the shared `styles.css` (tokens + base) internally, and
component styles load with the component imports because `@ilovecode33/ui`
builds in bundleless mode.

## Features

- Objectives with weighted key results in percent, number, or currency units.
- Progress at key-result, objective, and overall level.
- Period and sort filters, with an editable objective sheet and inline updates.
- Confirmed deletion of objectives and key results, plus a sample-data reset.
- Light, dark, and system appearance with selectable accent color.
- IndexedDB persistence through `@ilovecode33/persistence`.

## Data

The first visit loads a small sample set. Changes are written to the `okr-web`
IndexedDB database (`state` key-value store) immediately, so the tool works
offline and keeps one user's data on that device only.

Existing data from the pre-IndexedDB `localStorage` key `okr-web.state.v1` is
migrated on first load and the old key is removed. Clearing site data restores
the sample set.
