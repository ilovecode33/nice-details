# AGENTS.md — Agent Rules for This Repository

You are the maintenance agent for this monorepo. These rules apply to **every** change in this
repository and take priority over personal preference.

## 0. Language and documentation (important)

- **The project is English by default.** All documentation (`README.md`, `AGENTS.md`, the rule
  documents in `packages/ai-rules/`, code comments where added) must be written in English.
- Design principles, entry/exit criteria, and agent rules belong **only** in `AGENTS.md` and the
  split rule documents under `packages/ai-rules/`.
- **Never** put design-principle text, the HIG link, or slogans such as "mobile-first / touch-first
  / 44pt" into a landing page, demo, product UI, or component story meant for end users.
  - The landing page shows what components look like and how they are used — nothing about the rules
    behind them.
  - Principles are for developers and agents to follow, not copy for users.
- User-facing text in the landing page is localized by the app-level i18n module
  (`apps/ui-landing/src/i18n.ts`) with `en` (default), `zh-TW`, and `de`.
- If a user asks for principles "as agent rules", edit this file — do not edit the landing page.

## 1. Design principles (Apple HIG) — apply to all UI work

Reference:
[Apple Human Interface Guidelines: Design principles](https://developer.apple.com/design/human-interface-guidelines/design-principles)

| Principle          | What you must ensure                                                                                                                                 |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**        | One component does one job. No special-case branches for a single caller. If you cannot state its purpose in one sentence, do not add it.            |
| **Agency**         | Users can undo or leave: a Sheet closes via backdrop or ✕; no unexpected automatic actions.                                                          |
| **Responsibility** | State is visible and immediate: `aria-pressed` / `aria-checked` / `aria-selected` stay in sync with visuals. Errors are not conveyed by color alone. |
| **Familiarity**    | Follow platform conventions (iOS-style segmented control, switch, bottom sheet). Button labels use verbs.                                            |
| **Flexibility**    | One component works with touch, mouse, keyboard, VoiceOver, and dynamic font sizes.                                                                  |
| **Simplicity**     | Minimal props; extend native HTML attributes where possible. Avoid boolean-flag explosions.                                                          |
| **Craft**          | Use only design tokens from `styles.css`. Never hardcode colors, spacing, radii, or animation timings.                                               |
| **Delight**        | Motion only for state feedback and only when `prefers-reduced-motion` allows it. No decorative animation.                                            |

## 2. Mobile-first

- Base CSS targets a phone; desktop refinements belong only in `@media (min-width: 768px)`.
- Single-column / stacked layouts; no fixed widths. Use `var(--space-*)` and `minmax()`.
- No horizontal scrolling at 375px width.
- Every interactive element is at least 44 × 44 pt (`var(--touch)`), including icon buttons,
  switches, and segmented items.
- Handle safe areas with `env(safe-area-inset-*)` through the `--safe-*` tokens.
- Form inputs are at least 16px to avoid iOS Safari auto-zoom.

## 3. User-first / touch-first

- Put primary actions within thumb reach; keep destructive actions away from the main touch zone.
- No feature may depend on hover. Hover is a bonus only.
- Every interaction gives immediate feedback (`:active` plus synced ARIA state).
- Any operation that can lose data must be undoable or cancellable.
- Keyboard parity: sensible Tab order, a 2px accent `:focus-visible` ring, Enter/Space activation.
- Text contrast ≥ 4.5:1; support `prefers-color-scheme` and dynamic font sizes.
- Respect `prefers-reduced-motion`.

## 4. `packages/ui` rules

- Read the rules in `packages/ai-rules/` before adding a component, starting with
  [`component-entry.md`](packages/ai-rules/component-entry.md).
- Export every component and hook from `src/index.ts`. Shared types live in `@ilovecode33/ui-types`,
  grouped by domain; `ui` and `ui-core` do not re-export them.
- All user-facing text is passed via props **with English defaults**; the library must not depend on
  any i18n package. Localization is the consuming app's job.
- Providers support `defaultTheme` / `defaultAccent` overrides; keep the `gallery.theme` /
  `gallery.accent` storage keys unchanged.
- Every non-trivial component must appear in the landing page's **Component details** section in at
  least one real usage scenario — not an isolated button showcase.
- Do not add runtime dependencies without explaining why in the commit or an issue.
- After style changes, check the landing page at both 375px and 1280px.

## 5. Engineering workflow

- Use Bun as the package manager; every package name uses the `@ilovecode33/` scope.
- Apps use Rsbuild (on top of Rspack); libraries use Rslib in bundleless mode (`bundle: false` with
  a glob `source.entry`) so per-module imports and CSS modules are preserved. There is no standalone
  Storybook — component showcase lives in `apps/ui-landing`.
- Every frontend project follows [`frontend-project.md`](packages/ai-rules/frontend-project.md):
  component styles are CSS Modules (no app-level global stylesheets), and each component keeps
  `Name.tsx`, `Name.module.css`, and `Name.spec.tsx` together with the same base name.
- Do not map workspace `paths` in an app's `tsconfig.json` to library `src` (or set
  `resolve: { aliasStrategy: 'prefer-alias' }` in `rsbuild.config.ts`), because Rsbuild resolves
  `tsconfig.json` `paths` during bundling and fails on transitive workspace dependencies; resolve
  both typechecking and runtime imports through each library's built `dist`. `turbo` `dev` builds
  dependencies first (`dependsOn: ["^build"]`) and then runs their `build --watch` tasks alongside
  the app, so use the dependency-aware filter:
  `bunx turbo run dev --filter=@ilovecode33/okr-web...`. Library edits are picked up after the watch
  rebuild writes `dist`.
- TypeScript 7 removes `baseUrl`; write `paths` relative to the tsconfig file and declare `*.css` /
  `*.module.css` in an `env.d.ts` or `css-modules.d.ts` for every side-effect CSS import.
- `@ilovecode33/ui` builds in bundleless mode: component CSS Modules stay attached to their
  component imports, and `UIFoundation` loads the global `styles.css` (tokens + base/reset)
  internally. Wrap the app in `UIFoundation`; import `styles.css` explicitly only when using
  components without it.
- Common commands:
  - `bunx turbo run typecheck build`
  - `bunx turbo run dev --filter=@ilovecode33/ui-landing...` (3200)
  - `bunx turbo run dev --filter=@ilovecode33/okr-web...` (3201)
- `turbo.json` task `outputs` must be accurate, otherwise a cache hit restores nothing.
- Versioning and changelogs are managed with Changesets; follow [`RELEASING.md`](RELEASING.md) for
  authoring changesets, checking status before merge and releasing.
- Persisted data changes only through a versioned migration: bump the schema constant, keep old
  records readable, back up unreadable values, and refuse records from a newer release. See
  [`data-migrations.md`](packages/ai-rules/data-migrations.md).
- The `@ilovecode33/ai-rules` workspace holds the project rules as plain Markdown documents, one
  topic per file, with an index in `packages/ai-rules/README.md`. Rule content lives only in
  `AGENTS.md` and that workspace.
- Format and lint every Markdown document with `bun run format:md` and `bun run check:md`; see
  [`markdown-documentation.md`](packages/ai-rules/markdown-documentation.md).
- **Never push directly to `main`** — work on a topic branch and merge through a PR with green
  checks and a changeset. See [`git-workflow.md`](packages/ai-rules/git-workflow.md); install the
  local guard with `bun run hooks:install`.
- Every production deploy workflow (`.github/workflows/deploy-*.yml`) must skip a push to `main`
  that still carries a pending changeset, so new content never goes live under the previous version.
  Call the shared `pending-release` action, keep `workflow_dispatch` and a non-cancelling
  `concurrency` group, and add the workflow to the dispatch loop in `release.yml`. See
  [`deployment.md`](packages/ai-rules/deployment.md).

## 6. Definition of done

Before declaring work complete:

1. `bunx turbo run typecheck build test` is green.
2. If `packages/ui` changed, the **Component details** section covers the new scenario and was
   checked at 375px and 1280px. For gesture, motion, overlay, or scroll-lock changes, verify the
   full interactive flow in a real 375px browser (monotonic dismiss without upward rebound, smooth
   snap-back without flicker, and no background scroll pass-through).
3. If styles changed, self-check against sections 1–3 (44pt, ARIA, focus ring, reduced motion, dark
   mode).
4. No design-principle copy in demos or the landing page (see section 0).
5. Any workspace change includes a corresponding `.changeset/*.md` file (or an empty changeset when
   no release is needed) and `bun run check:changesets` is green.
6. Any changed behavior, convention, or setup is promptly updated in the relevant documentation
   (`README.md`, `AGENTS.md`, or `packages/ai-rules/`), and `bun run format:md` / `bun run check:md`
   pass.
7. Any added or changed deploy workflow follows section 5 and
   [`deployment.md`](packages/ai-rules/deployment.md) (version gate, dispatch loop, concurrency).
8. Never commit `node_modules`, `dist`, or `.turbo`.
