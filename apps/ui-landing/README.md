# @ilovecode33/ui-landing

The internal component gallery for `@ilovecode33/ui`, showing the library's components in real usage
scenarios.

## What it demonstrates

A single-page React app with a hero and a **Component details** section. The table of contents and
group titles are both generated from one `COMPONENT_GROUPS` source of truth in
`src/component-groups.ts`, so they cannot drift apart. Each demo card shows components in a real
screen rather than as isolated buttons. Scenarios include upload overview, album settings, album
library, create-album form, upload progress, photo gallery, empty search and delete confirmation,
plus floating surfaces and media.

- **Photo Wall demo** — an interactive scene built on the real `@ilovecode33/photo-wall` renderer.
  Drag a virtual light (or focus it and use the arrow keys), adjust frame depth, light height and
  softness, and reset the scene.
- **Localized copy** — all user-facing text comes from the app-level i18n module in `src/i18n.ts`,
  with `en` (default), `zh-TW` and `de`. The library itself has no i18n dependency.
- **Stable `data-ui` slots** — demos target stable slots instead of hashed class names, so the
  gallery keeps working across library styling refactors.
- **Single floating footer dock** — `DockNavigation` is the only navigation; component index and
  section links live there instead of a header or sidebar.

## Run locally

From the repository root (Bun 1.4.4, workspaces):

```bash
bun install
bunx turbo run dev --filter=@ilovecode33/ui-landing...
```

The dev server listens on **port 3200** (see [`rsbuild.config.ts`](rsbuild.config.ts)).

Common scripts from `package.json`: `dev`, `build`, `preview`, `typecheck`, `clean`.

## Dependencies

- Runtime: `@ilovecode33/ui`, `@ilovecode33/photo-wall`, `@ilovecode33/ui-types`, `lucide-react`,
  `react`, `react-dom`.
- Dev: `@rsbuild/core`, `@rsbuild/plugin-react`, TypeScript and React types.

The dependency-aware dev command above lets Turbo build the workspace libraries once and keep their
`build --watch` tasks running; this app consumes every workspace library from its bundleless `dist`.
See [`../../packages/ui/ROADMAP.md`](../../packages/ui/ROADMAP.md) for the planned component
expansion.

## Build and deployment

`bunx turbo run build --filter=@ilovecode33/ui-landing` emits a static site to
`apps/ui-landing/dist`. This is a private internal demo: PR previews deploy to Cloudflare Pages, but
production deployment is not enabled yet (see [`DEPLOYMENT.md`](DEPLOYMENT.md)). `bun run preview`
serves the built output locally.

## Rules and release process

- [`CHANGELOG.md`](CHANGELOG.md) — app release history.
- [Repository README](../../README.md) and [`RELEASING.md`](../../RELEASING.md) — monorepo overview
  and Changesets workflow.
- [AI rules index](../../packages/ai-rules/README.md),
  [component entry criteria](../../packages/ai-rules/component-entry.md),
  [release exit criteria](../../packages/ai-rules/release-exit.md),
  [mobile-first](../../packages/ai-rules/mobile-first.md),
  [user-first](../../packages/ai-rules/user-first.md),
  [floating surfaces](../../packages/ai-rules/floating-surfaces.md),
  [photo wall](../../packages/ai-rules/photo-wall.md).
- [`AGENTS.md`](../../AGENTS.md) — agent entry point for the repository.

## Deployment

PR previews deploy to Cloudflare Pages via
[`.github/workflows/preview-ui-landing.yml`](../../.github/workflows/preview-ui-landing.yml), and
the preview URL is commented on the PR. Production deployment is not enabled yet. See
[`DEPLOYMENT.md`](DEPLOYMENT.md) for details, required secrets, caching, and the remaining manual
Cloudflare step.
