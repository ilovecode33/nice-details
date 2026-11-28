# @ilovecode33/nice-details

A Bun/Turborepo monorepo pairing three frontend apps with shared, publishable UI and editor
libraries.

Documentation is English by default. Design and agent rules live in [`AGENTS.md`](AGENTS.md) and the
[`packages/ai-rules/`](packages/ai-rules/README.md) workspace; they are linked below, not repeated
here.

## Structure

```text
apps/
  blog/          # @ilovecode33/blog — React Router blog using the UI and editor SDKs in read-only mode (port 3100)
  editor/        # @ilovecode33/editor-app — minimal WYSIWYG demo built on editor-core (port 3000)
  ui-landing/    # @ilovecode33/ui-landing — internal component gallery for @ilovecode33/ui (port 3200)
packages/
  ai-rules/      # @ilovecode33/ai-rules — private, unpublished workspace indexing AI rules as topic-based Markdown
  editor-core/   # @ilovecode33/editor-core — framework-agnostic Lexical SDK with a small typed controller
  photo-wall/    # @ilovecode33/photo-wall — seedable, procedural framed-photo layout generator and renderer
  state-machine/ # @ilovecode33/state-machine — minimal typed state machine shared by gesture and UI logic
  ui/            # @ilovecode33/ui — React component and hook library, renderer over tokens and contracts
  ui-core/       # @ilovecode33/ui-core — framework-neutral reducers and portable component contracts
  ui-tokens/     # @ilovecode33/ui-tokens — single source of truth for token values, with CSS/JSON/Swift generators
  ui-types/      # @ilovecode33/ui-types — shared, framework-portable TypeScript types grouped by domain
  ui-swift/      # SwiftUI skeleton mirroring the UI contracts — a Swift package, NOT an npm workspace
```

Every npm package uses the `@ilovecode33/` scope. Apps build with Rsbuild (Rspack + HMR); libraries
build with Rslib in bundleless mode (ESM + `.d.ts` + per-module assets). App `tsconfig.json` files
map paths to library `src` for typechecking, while runtime imports use the libraries' built `dist`.
Run an app with the dependency-aware filter (`--filter=<app>...`) so Turbo builds the libraries once
and keeps their `build --watch` tasks running.

## Common commands

```bash
bun install
bun run dev                                             # all apps
bunx turbo run dev --filter=@ilovecode33/editor-app...  # editor — port 3000
bunx turbo run dev --filter=@ilovecode33/blog...        # blog — port 3100
bunx turbo run dev --filter=@ilovecode33/ui-landing...  # component gallery — port 3200
bunx turbo run dev --filter=@ilovecode33/okr-web...     # personal OKRs — port 3201
bunx turbo run typecheck build                          # typecheck + topological build, cached in .turbo
bunx turbo run test                                     # all packages that define a test task
bun run format:md                                       # format all Markdown documents
bun run check:md                                        # check Prettier formatting and Markdown lint
bun run changeset                                      # author a changeset interactively
bun run check:changesets                               # changeset status since origin/main
bun run version:packages                               # consume changesets, bump versions, rewrite changelogs
```

`bun run typecheck`, `bun run build`, `bun run test` and `bun run clean` are top-level Turbo
aliases; see [`turbo.json`](turbo.json) for task wiring. Versioning and changelogs are managed with
Changesets, as described in [`RELEASING.md`](RELEASING.md).

## Workspaces, versions and READMEs

All fourteen npm workspaces have a README, as does the Swift package. Versions below are the current
ones.

| Workspace                                                        | Version | README                                |
| ---------------------------------------------------------------- | ------- | ------------------------------------- |
| [`@ilovecode33/blog`](apps/blog/README.md)                       | 0.1.1   | App                                   |
| [`@ilovecode33/editor-app`](apps/editor/README.md)               | 0.1.1   | App                                   |
| [`@ilovecode33/ui-landing`](apps/ui-landing/README.md)           | 0.1.1   | App                                   |
| [`@ilovecode33/okr-web`](apps/okr-web/README.md)                 | 0.1.0   | App                                   |
| [`@ilovecode33/okr-realtime`](apps/okr-realtime/README.md)       | 0.1.0   | Worker                                |
| [`@ilovecode33/ai-rules`](packages/ai-rules/README.md)           | 0.1.1   | Rule index                            |
| [`@ilovecode33/editor-core`](packages/editor-core/README.md)     | 0.1.1   | SDK                                   |
| [`@ilovecode33/okr-shared`](packages/okr-shared/README.md)       | 0.1.0   | Library                               |
| [`@ilovecode33/persistence`](packages/persistence/README.md)     | 0.1.0   | Library                               |
| [`@ilovecode33/state-machine`](packages/state-machine/README.md) | 0.0.0   | Library                               |
| [`@ilovecode33/photo-wall`](packages/photo-wall/README.md)       | 0.2.0   | Library                               |
| [`@ilovecode33/ui`](packages/ui/README.md)                       | 0.3.1   | Library                               |
| [`@ilovecode33/ui-core`](packages/ui-core/README.md)             | 0.3.1   | Library                               |
| [`@ilovecode33/ui-tokens`](packages/ui-tokens/README.md)         | 0.3.1   | Library                               |
| [`@ilovecode33/ui-types`](packages/ui-types/README.md)           | 0.3.1   | Library                               |
| `UISwift` (`packages/ui-swift`)                                  | —       | [README](packages/ui-swift/README.md) |

The four `ui*` packages are a Changesets `fixed` group and always upgrade together; internal
dependents receive at least a patch bump automatically.

## Where to find what

| Need                                                        | Go to                                                                                                                                                                        |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Agent entry point, repo rules, definition of done           | [`AGENTS.md`](AGENTS.md)                                                                                                                                                     |
| Rule index and scope table                                  | [`packages/ai-rules/README.md`](packages/ai-rules/README.md)                                                                                                                 |
| Design principles, mobile-first, touch-first                | [`design-principles.md`](packages/ai-rules/design-principles.md), [`mobile-first.md`](packages/ai-rules/mobile-first.md), [`user-first.md`](packages/ai-rules/user-first.md) |
| Frontend project conventions (CSS Modules, same-name files) | [`frontend-project.md`](packages/ai-rules/frontend-project.md)                                                                                                               |
| Markdown documentation and formatting                       | [`markdown-documentation.md`](packages/ai-rules/markdown-documentation.md), `bun run format:md`, `bun run check:md`                                                          |
| Component entry / release exit / PR checklist               | [`component-entry.md`](packages/ai-rules/component-entry.md), [`release-exit.md`](packages/ai-rules/release-exit.md), [`pr-checklist.md`](packages/ai-rules/pr-checklist.md) |
| Floating surfaces, photo wall, editor core rules            | [`floating-surfaces.md`](packages/ai-rules/floating-surfaces.md), [`photo-wall.md`](packages/ai-rules/photo-wall.md), [`editor-core.md`](packages/ai-rules/editor-core.md)   |
| Deprecation policy                                          | [`deprecation.md`](packages/ai-rules/deprecation.md)                                                                                                                         |
| Component gallery and real usage scenarios                  | [`apps/ui-landing/README.md`](apps/ui-landing/README.md) — the **Component details** section, port 3200                                                                      |
| Component roadmap and platform-neutral architecture         | [`packages/ui/ROADMAP.md`](packages/ui/ROADMAP.md)                                                                                                                           |
| Release workflow and changeset commands                     | [`RELEASING.md`](RELEASING.md), [`.changeset/config.json`](.changeset/config.json)                                                                                           |
| Release history                                             | Each workspace's `CHANGELOG.md`, e.g. [`packages/ui/CHANGELOG.md`](packages/ui/CHANGELOG.md)                                                                                 |

## Blog deployment

The blog is deployed to Cloudflare Pages by
[`.github/workflows/deploy-blog.yml`](.github/workflows/deploy-blog.yml) on pushes to `main`; pull
requests get a preview deployment from
[`.github/workflows/preview-blog.yml`](.github/workflows/preview-blog.yml). Client-side routing for
direct visits to `/about` uses [`apps/blog/public/_redirects`](apps/blog/public/_redirects). Caching
is declared in [`apps/blog/public/_headers`](apps/blog/public/_headers): only hashed `/static/*`
assets get a one-year immutable cache. HTML is intentionally not matched, so it keeps Pages'
`max-age=0, must-revalidate` and every deployment refreshes immediately — no extra API token or
zone-level configuration is required. The ui-landing component gallery has the same PR preview
support: [`.github/workflows/preview-ui-landing.yml`](.github/workflows/preview-ui-landing.yml)
deploys each PR build to the `ilovecode33-ui` Pages project under `pr-<PR number>` and comments the
URL on the PR. Its production deployment is not enabled yet; see
[`apps/ui-landing/DEPLOYMENT.md`](apps/ui-landing/DEPLOYMENT.md). The OKR web app also gets PR
previews through [`.github/workflows/preview-okr-web.yml`](.github/workflows/preview-okr-web.yml) on
the `ilovecode33-okr-web` Pages project. Production deploys from `main` to
`https://okr.ilovecode33.fyi`, with realtime sync served by the
[`@ilovecode33/okr-realtime`](apps/okr-realtime/README.md) Worker at `https://sync.ilovecode33.fyi`;
setup details live in [`apps/okr-web/DEPLOYMENT.md`](apps/okr-web/DEPLOYMENT.md).
