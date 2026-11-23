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

## 3a. Floating surfaces and gesture feedback

Chrome (headers, navigation, footers, docks) floats above content instead of
occupying layout space. The host reserves room with padding or `scroll-padding`
so nothing is permanently covered.

- [ ] Glass material comes from `--glass-*` tokens: fill, stroke, highlight, shadow, blur, saturation. No hardcoded translucency.
- [ ] A solid `--bg-elevated` fallback exists when `backdrop-filter` is unsupported.
- [ ] Floating bars resolve safe-area insets and keep every interactive target at least 44 × 44 pt.
- [ ] Translucent surfaces keep text contrast in light, dark, and all five accents.
- [ ] Drag deformation is direct manipulation feedback: rubber-band resistance (harder the farther it is pulled), directional stretch/squash, spring back on release.
- [ ] Press feedback blooms from the pointer position via `useDeform()`'s `--glow-*` variables and `PressGlow`. It sits behind content, uses only `--glow-*` tokens, never takes focus, and is disabled with deformation or under reduced motion. Passing `held` from `useDeform().state.active` keeps the glow lit for the whole press and fades it on release.
- [ ] Buttons use the same glass material as the Segmented pill: an accent-tinted translucent fill with `backdrop-filter` and a theme-adaptive edge (`--seg-thumb-stroke`). Primary uses a stronger tint than secondary to keep their hierarchy, and both keep the theme's normal text colour. The accent halo is interaction feedback only — shown on hover or while held, never at rest — and buttons render no press-point spotlight.
- [ ] Segmented selection is one moving pill: deformation and the bloom belong to the selected block, not the track. Pressing the pill starts a free horizontal drag that snaps to the nearest slot and selects it on release; pressing another slot only slides the pill there without lighting it. Keyboard changes also slide (no slide under reduced motion).
- [ ] The selected pill is an accent-tinted glass surface (`--seg-thumb-*` tokens) that keeps the theme's normal text colour — no inverted label — so it stays calm while dragged. Its edge is white in dark themes and accent-coloured in light themes, where a white edge would vanish; a brightened accent halo adds depth. The halo and spotlight persist for the whole press and fade only on release — no one-shot flash.
- [ ] Stretch is driven by the dragged axis's own displacement; the perpendicular squash is paired with that pull. No rotation or tilt is added.
- [ ] A drag beyond the click threshold, or a release outside the control, must not fire the control's click / activation handlers.
- [ ] Deformation is disabled under `prefers-reduced-motion`; the static layout and state remain correct.
- [ ] On touch, `touch-action` follows the drag axis (x → `pan-y`, y → `pan-x`, both → `none`) and a non-passive `touchmove` guard keeps the browser from canceling the gesture; page scrolling still works on Buttons.
- [ ] The state model and semantics live in `@ilovecode33/ui-core`; the React renderer only maps them to styles.
- [ ] A SwiftUI counterpart is recorded on the contract (material plus spring).

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
