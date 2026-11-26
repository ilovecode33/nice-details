# @ilovecode33/editor-app

A minimal, framework-free WYSIWYG editor demo built directly on the `@ilovecode33/editor-core` SDK.

## What it demonstrates

The app is a plain TypeScript entry (`src/index.ts`) over a static HTML template — no React renderer. It calls `createEditor` on an editable surface seeded with sample HTML and focuses it on load. It renders:

- A formatting toolbar with H1–H3 heading buttons and Bold / Italic, built from `data-command` buttons.
- Active state synced from `onStateChange`: each button toggles `is-active` and `aria-pressed` to match the editor selection.
- A live "View HTML" output panel and character count updated on every `onChange`, with a fallback for the empty state.
- Selection preserved when a toolbar button is pressed by cancelling `mousedown`.

Editing is local only; there is no collaboration backend. Document state, undo/redo and serialization come from Lexical via `@ilovecode33/editor-core`.

## Run locally

From the repository root (Bun 1.4.4, workspaces):

```bash
bun install
bunx turbo run dev --filter=@ilovecode33/editor-app
```

The dev server listens on **port 3000** (see [`rsbuild.config.ts`](rsbuild.config.ts)).

Common scripts from `package.json`: `dev`, `build`, `preview`, `typecheck`, `clean`.

## Dependencies

- Runtime: `@ilovecode33/editor-core` (workspace package, backed by Lexical).
- Dev: `@rsbuild/core`, TypeScript.

No React or UI package is used — this is deliberately the smallest possible host for the editor SDK.

## Build and deployment

`bunx turbo run build --filter=@ilovecode33/editor-app` emits a static site to `apps/editor/dist`. The app is a private internal demo; no Cloudflare Pages workflow is configured for it. `bun run preview` serves the built output locally.

## Rules and release process

- [`CHANGELOG.md`](CHANGELOG.md) — app release history.
- [Repository README](../../README.md) and [`RELEASING.md`](../../RELEASING.md) — monorepo overview and Changesets workflow.
- [AI rules index](../../packages/ai-rules/README.md) and [editor core rules](../../packages/ai-rules/editor-core.md).
- [`AGENTS.md`](../../AGENTS.md) — agent entry point for the repository.
