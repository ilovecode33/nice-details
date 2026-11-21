# AGENTS.md — Agent Rules for This Repository

You are the maintenance agent for this monorepo. These rules apply to **every** change in this repository and take priority over personal preference.

## 0. Language and documentation (important)

- **The project is English by default.** All documentation (`README.md`, `AGENTS.md`, `QUALITY.md`, code comments where added) must be written in English.
- Design principles, entry/exit criteria, and agent rules belong **only** in `AGENTS.md` and `packages/ui/QUALITY.md`.
- **Never** put design-principle text, the HIG link, or slogans such as "mobile-first / touch-first / 44pt" into a landing page, demo, product UI, or component story meant for end users.
  - The landing page shows what components look like and how they are used — nothing about the rules behind them.
  - Principles are for developers and agents to follow, not copy for users.
- User-facing text in the landing page is localized by the app-level i18n module (`apps/ui-landing/src/i18n.ts`) with `en` (default), `zh-TW`, and `de`.
- If a user asks for principles "as agent rules", edit this file — do not edit the landing page.

## 1. Design principles (Apple HIG) — apply to all UI work

Reference: https://developer.apple.com/design/human-interface-guidelines/design-principles

| Principle | What you must ensure |
|---|---|
| **Purpose** | One component does one job. No special-case branches for a single caller. If you cannot state its purpose in one sentence, do not add it. |
| **Agency** | Users can undo or leave: a Sheet closes via backdrop or ✕; no unexpected automatic actions. |
| **Responsibility** | State is visible and immediate: `aria-pressed` / `aria-checked` / `aria-selected` stay in sync with visuals. Errors are not conveyed by color alone. |
| **Familiarity** | Follow platform conventions (iOS-style segmented control, switch, bottom sheet). Button labels use verbs. |
| **Flexibility** | One component works with touch, mouse, keyboard, VoiceOver, and dynamic font sizes. |
| **Simplicity** | Minimal props; extend native HTML attributes where possible. Avoid boolean-flag explosions. |
| **Craft** | Use only design tokens from `styles.css`. Never hardcode colors, spacing, radii, or animation timings. |
| **Delight** | Motion only for state feedback and only when `prefers-reduced-motion` allows it. No decorative animation. |

## 2. Mobile-first

- Base CSS targets a phone; desktop refinements belong only in `@media (min-width: 768px)`.
- Single-column / stacked layouts; no fixed widths. Use `var(--space-*)` and `minmax()`.
- No horizontal scrolling at 375px width.
- Every interactive element is at least 44 × 44 pt (`var(--touch)`), including icon buttons, switches, and segmented items.
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

- Read `packages/ui/QUALITY.md` before adding a component.
- Export every component and its types from `src/index.ts`.
- All user-facing text is passed via props **with English defaults**; the library must not depend on any i18n package. Localization is the consuming app's job.
- Providers support `defaultTheme` / `defaultAccent` overrides; keep the `gallery.theme` / `gallery.accent` storage keys unchanged.
- Every non-trivial component must appear in the landing page's **Component details** section in at least one real usage scenario — not an isolated button showcase.
- Do not add runtime dependencies without explaining why in the commit or an issue.
- After style changes, check the landing page at both 375px and 1280px.

## 5. Engineering workflow

- Use Bun as the package manager; every package name uses the `@ilovecode33/` scope.
- Apps use Rsbuild (on top of Rspack); libraries use Rslib. There is no standalone Storybook — component showcase lives in `apps/ui-landing`.
- App `tsconfig.json` maps paths to library `src`; do not require a library build before hot reload.
- Common commands:
  - `bunx turbo run typecheck build`
  - `bunx turbo run dev --filter=@ilovecode33/ui-landing` (3200)
- `turbo.json` task `outputs` must be accurate, otherwise a cache hit restores nothing.

## 6. Definition of done

Before declaring work complete:

1. `bunx turbo run typecheck build` is green.
2. If `packages/ui` changed, the **Component details** section covers the new scenario and was checked at 375px and 1280px.
3. If styles changed, self-check against sections 1–3 (44pt, ARIA, focus ring, reduced motion, dark mode).
4. No design-principle copy in demos or the landing page (see section 0).
5. Never commit `node_modules`, `dist`, or `.turbo`.
