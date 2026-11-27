# @ilovecode33/blog

A small React Router single-page app that renders a blog using the shared UI and editor SDKs.

## What it demonstrates

The app is a two-route SPA (Posts at `/`, About at `/about`) wrapped in `UIFoundation`, so surfaces, controls and motion all come from the shared design tokens. It renders:

- **Posts** — a readonly article whose HTML is loaded through `createEditor({ readonly: true })` from `@ilovecode33/editor-core`, shown with a "Readonly mode" badge and cleaned up on unmount.
- **About** — a short static page describing the demo.
- **Site navigation** — a reusable `DockNavigation` from `@ilovecode33/ui`, collapsed by default. Links keep real `href`s for accessibility, while the router handles selection and navigation. Navigation lives in a single floating dock; there is no separate header or sidebar.

The dev server enables `historyApiFallback` so direct visits to client-side routes such as `/about` serve `index.html`.

## Run locally

From the repository root (Bun 1.4.4, workspaces):

```bash
bun install
bunx turbo run dev --filter=@ilovecode33/blog...
```

The dev server listens on **port 3100** (see [`rsbuild.config.ts`](rsbuild.config.ts)).

Common scripts from `package.json`: `dev`, `build`, `preview`, `typecheck`, `clean`.

## Dependencies

- Runtime: `@ilovecode33/ui`, `@ilovecode33/editor-core`, `react`, `react-dom`, `react-router-dom` (v7).
- Dev: `@rsbuild/core`, `@rsbuild/plugin-react`, TypeScript and React types.

All `@ilovecode33/*` packages are workspace dependencies. Use the dependency-aware dev command above; Turbo builds the libraries once and keeps their `build --watch` tasks running while this app consumes their bundleless `dist`.

## Build and deployment

`bunx turbo run build --filter=@ilovecode33/blog` emits a static site to `apps/blog/dist`.

- `.github/workflows/deploy-blog.yml` deploys `dist` to Cloudflare Pages (project `ilovecode33-blog`) on pushes to `main`.
- `.github/workflows/preview-blog.yml` publishes a preview deployment for pull requests from the same repository and comments the URL on the PR.
- `public/_redirects` rewrites all paths to `/index.html` with a `200` so client-side routes work on Pages.
- `public/_headers` declares caching natively: hashed `/static/*` assets get `public, max-age=31536000, immutable`. HTML is intentionally not matched, so it keeps `max-age=0, must-revalidate` and every deployment serves fresh markup. No zone-level API configuration is needed.

## Rules and release process

- [`CHANGELOG.md`](CHANGELOG.md) — app release history.
- [Repository README](../../README.md) and [`RELEASING.md`](../../RELEASING.md) — monorepo overview and Changesets workflow.
- [AI rules index](../../packages/ai-rules/README.md), [component entry criteria](../../packages/ai-rules/component-entry.md), [mobile-first](../../packages/ai-rules/mobile-first.md), [user-first](../../packages/ai-rules/user-first.md), [floating surfaces](../../packages/ai-rules/floating-surfaces.md), [editor core](../../packages/ai-rules/editor-core.md).
- [`AGENTS.md`](../../AGENTS.md) — agent entry point for the repository.
