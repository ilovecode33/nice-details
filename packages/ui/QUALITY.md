# @ilovecode33/ui — Entry and Exit Criteria

Design reference: [Apple Human Interface Guidelines — Design Principles](https://developer.apple.com/design/human-interface-guidelines/design-principles)

> Core idea: **mobile-first, user-first, touch-first**.
> A component that only works with a mouse, hover, and a wide viewport does not belong in this library.

---

## 1. Principle mapping

| HIG principle | Concrete requirement in this library |
|---|---|
| **Purpose** | One component, one job. Props stay within that job. Reject components whose purpose cannot be stated in one sentence. |
| **Agency** | Users can undo or leave: a Sheet closes via backdrop or ✕; forms never auto-submit. |
| **Responsibility** | State is visible and immediate: `aria-pressed` / `aria-checked` / `aria-selected` match the visuals. Errors are not communicated by color alone. |
| **Familiarity** | Use platform conventions (iOS-style segmented control, switch, bottom sheet). Button labels use verbs. |
| **Flexibility** | One component supports touch, mouse, keyboard, VoiceOver, and dynamic font sizes. |
| **Simplicity** | Minimal props; extend native HTML attributes. No boolean-flag explosion. |
| **Craft** | Use only design tokens from `styles.css`. No hardcoded colors, spacing, radii, or animation timings. |
| **Delight** | Motion exists only for state feedback and respects `prefers-reduced-motion`. No decorative animation. |

## 2. Mobile-first

- Base CSS targets a phone; desktop enhancements only in `@media (min-width: 768px)`.
- Single-column / stacked layouts, no fixed widths. Use `var(--space-*)` and `minmax()`.
- No horizontal scrolling at 375px.
- Every interactive element is at least 44 × 44 pt (`var(--touch)`), including icon buttons, switches, and segmented items.
- Use `env(safe-area-inset-*)` for safe areas via the `--safe-*` tokens.
- Form inputs are at least 16px so iOS Safari does not auto-zoom.

## 3. User-first / touch-first

- Primary actions sit within thumb reach; destructive actions stay away from the main touch zone.
- No feature depends on hover; hover is a bonus only.
- Every interaction gives immediate feedback (`:active` plus synced ARIA state).
- Data-losing operations must be undoable or cancellable.
- Keyboard parity: sensible Tab order, a 2px accent `:focus-visible` ring, Enter/Space activation.
- Text contrast ≥ 4.5:1; support dark mode and dynamic font sizes.
- Respect `prefers-reduced-motion`.

---

## 4. Entry criteria (before a new component is merged)

Every PR adding a component must satisfy all of the following:

- [ ] **Single responsibility** — its purpose is one sentence; no overlap with existing components.
- [ ] **Minimal API** — props extend native HTML attributes where possible; no boolean-flag explosion.
- [ ] **Complete types** — all props exported as `type` / `interface`; `tsc --noEmit` passes.
- [ ] **Landing page showcase** — at least one real usage scenario in `apps/ui-landing` under **Component details**, not an isolated button array.
- [ ] **Accessible** — correct role, aria-label, focus ring, 44pt touch target.
- [ ] **Design tokens only** — colors, spacing, radii, and motion come from `styles.css`.
- [ ] **Mobile-first CSS** — phone base rules; no horizontal scrolling at 375px.
- [ ] **Reduced motion** — animation is disabled when `prefers-reduced-motion: reduce` is set.
- [ ] **No new runtime dependency** — if one is needed, explain why first.
- [ ] **No i18n dependency** — all text passed via props with English defaults.

## 5. Exit criteria (before a release)

- [ ] `bunx turbo run typecheck build --filter=@ilovecode33/ui` is green.
- [ ] The landing page has been checked at **375px (phone)** and **1280px (desktop)**.
- [ ] Tab through the whole page: order is correct, focus ring is visible, no trapped focus.
- [ ] Switch between light / dark / system: no flashing or wrong tokens.
- [ ] Check all five accent colors for sufficient text contrast.
- [ ] With reduced motion enabled, animations stop.
- [ ] Measure the main touch targets in the browser inspector (≥ 44px).
- [ ] `dist/index.js`, `dist/index.d.ts`, and `dist/styles.css` are all produced.
- [ ] Breaking changes are recorded in the commit message / changelog.

## 6. Deprecation and removal

- Unused by any app for six months and absent from the landing page showcase → mark `@deprecated`, remove in the next version.
- Cannot satisfy the HIG / touch rules without breaking the existing API → remove it rather than keeping a compromise version.
- When removing, document the replacement in the changelog.

---

## PR checklist template

```md
### Entry checks
- [ ] Single responsibility
- [ ] Minimal API / complete types
- [ ] Component details scenario on the landing page
- [ ] a11y (role / aria / focus / 44pt)
- [ ] Design tokens only
- [ ] 375px mobile-first / no horizontal scroll
- [ ] Reduced motion
- [ ] No new runtime dependency
- [ ] Text via props, English defaults
```
