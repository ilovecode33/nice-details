# Floating surfaces and gesture feedback

Scope: Applies to the shared @ilovecode33/ui library.

Chrome (headers, navigation, footers, docks) floats above content instead of occupying layout space.
The host reserves room with padding or `scroll-padding` so nothing is permanently covered.

- [ ] Glass material comes from `--glass-*` tokens: fill, stroke, highlight, shadow, blur,
      saturation. No hardcoded translucency.
- [ ] A solid `--bg-elevated` fallback exists when `backdrop-filter` is unsupported.
- [ ] Floating bars resolve safe-area insets and keep every interactive target at least 44 × 44 pt.
- [ ] Translucent surfaces keep text contrast in light, dark, and all five accents.
- [ ] Containers that clip children must not cut off interaction halos: use `overflow: clip` with
      `overflow-clip-margin` instead of `overflow: hidden` so a hovered child's outer glow can
      extend past the edge while rounded corners stay intact. For a scroll container
      (`overflow-y: auto`, which cannot use clip-margin) opt the button into `haloPortal`: the
      **whole button** (with its own box-shadow) is portalled to `document.body`, so the button and
      its glow are one unit and can never be separated by a clip boundary. A transparent placeholder
      holds the layout slot and carries a unique anchor-name; the fixed button is tethered to it
      with CSS Anchor Positioning (`position-anchor`, `anchor()`, `anchor-size()`), so the browser
      keeps it in place through scroll and resize with no JS tracking. The portalled button needs
      `--z-portal` (above overlay stacks such as Sheet's 500), otherwise it is hidden behind them.
      This requires anchor-positioning support (Chrome/Edge 125+, Safari 27+).
- [ ] Drag deformation is direct manipulation feedback: rubber-band resistance (harder the farther
      it is pulled), directional stretch/squash, spring back on release.
- [ ] Press feedback blooms from the pointer position via `useDeform()`'s `--glow-*` variables and
      `PressGlow`. It sits behind content, uses only `--glow-*` tokens, never takes focus, and is
      disabled with deformation or under reduced motion. Passing `held` from
      `useDeform().state.active` keeps the glow lit for the whole press and fades it on release.
- [ ] Buttons use the same glass material as the Segmented pill: a semantic-tinted translucent fill
      with `backdrop-filter` and a theme-adaptive edge. Primary carries a clearly stronger accent
      tint than secondary so it reads as the main action, while both keep the theme's normal text
      colour with ≥ 4.5:1 contrast. Destructive uses the danger hue. The halo is interaction
      feedback only — shown on hover or while held, never at rest — and eases in/out with
      `--glow-dur`. It uses a pure-hue glow (two blur layers, no white) so it stays visible on both
      near-white and near-dark tracks. Buttons render no press-point spotlight.
- [ ] Shared CSS material is composed from tokens, not copied: one glass recipe serves all tinted
      button variants (each only sets `--btn-hue`/`--btn-fill`/`--btn-edge`/ink), `--glass-backdrop`
      replaces repeated blur+saturate declarations, and the two-layer halo is declared once per
      interaction selector so hue overrides resolve on the element. Custom properties that reference
      another variable must be declared on the element that needs the override — a `:root`-level
      token would bake in the accent hue.
- [ ] Segmented selection is one moving pill: deformation and the bloom belong to the selected
      block, not the track. Pressing the pill starts a free horizontal drag that snaps to the
      nearest slot and selects it on release; clicking or pressing another slot only slides the pill
      there — no press bloom or delayed highlight. Highlight is derived from the hovered slot index,
      so a click that moves the active slot under a stationary pointer lights it immediately.
      Keyboard changes also slide (no slide under reduced motion). Drag starts heavy: while the
      pointer is within a slot's radius (36px, capped at half the slot spacing) the pill covers a
      minimum 12% of the pointer delta near the slot centre, ramping to 1:1 across a 28px breakaway
      band; once the pointer leaves the radius it tracks 1:1. A light 25% magnet adds weight when
      approaching or entering a slot centre, handing off continuously at the radius boundary. Beyond
      the first/last slot the raw drag offset is hard-clamped to the end slot (no rubber-band, no
      `resist`, no excursion past the edge). A release that was clamped at an edge without changing
      selection skips the settle animation entirely, so the pill does not visibly rebound. After
      release the pill snaps to the slot under the pointer and settles with `--spring-dur`/`--ease`
      (no overshoot) for ~220ms before returning to the normal `--dur`/`--ease` slide; any new
      interaction cancels the settle window. Reduced motion skips both damping (plain clamp) and
      settling. The damped drag offset lives on one persistent inner layer
      (`<div data-ui="segmented__thumb-shift">`) inside the thumb, applied as its `translateX` =
      damped offset minus `useDeform`'s translateX, so the net movement keeps the dead-zone
      breakaway while deform feedback still runs; the outer thumb keeps its static seated slot
      `left` and `useDeform`'s transform/scale/glow untouched — never animate its `left`. Measure
      the spotlight against the outer thumb with that pending inner shift subtracted (equivalently,
      against the translated inner layer after render); measuring the inner layer's pre-render rect
      paints the percentage ~80px ahead of the pointer mid-drag. The inner layer settles with
      `--spring-dur` and `--ease` (no overshoot); reduced motion skips damping and settling. The
      thumb exposes stable hooks `data-ui="segmented__thumb [--dragging|--settling]"`. The engine is
      shared as `useSegmentPillDrag` (exported from `@ilovecode33/ui`) and also drives the
      appearance switcher; compact pill groups pass a smaller `feel`
      (`slotRadius`/`deadZone`/`breakaway`/`magnetStrength`) so the snap zone stays proportional to
      the 44px icon slot instead of swallowing it.
- [ ] The selected pill is an accent-tinted glass surface (`--seg-thumb-*` tokens) that keeps the
      theme's normal text colour — no inverted label — so it stays calm while dragged. Its edge is
      white in dark themes and accent-coloured in light themes, where a white edge would vanish; a
      brightened accent halo adds depth. The halo and spotlight persist for the whole press and fade
      only on release; hover uses the button-style two-layer glow. No one-shot flash or delayed
      bloom.
- [ ] Stretch is driven by the dragged axis's own displacement; the perpendicular squash is paired
      with that pull. No rotation or tilt is added.
- [ ] A drag beyond the click threshold, or a release outside the control, must not fire the
      control's click / activation handlers.
- [ ] Switch drag: on touch it arms only after `LONG_PRESS_MS` (450ms); before that, movement past
      `LONG_PRESS_SLOP` cancels the press so the page scrolls instead of flipping the switch. Mouse
      drags stay immediate. Once armed, the knob follows the pointer and previews the destination
      track colour; it stretches only while crossing the middle of the track (a circle at both
      seats, widest halfway) and releasing commits the side the knob ended on. A sub-threshold press
      or a plain click still toggles, and the synthetic click after a drag is suppressed so it never
      double-toggles. Keyboard activation is unchanged. The on track uses the same accent glass as
      the pill (`--seg-thumb-solid` fill, `--seg-thumb-stroke` edge, `--seg-thumb-halo` glow,
      `--glass-backdrop`), not a translucent fill composited straight onto the page background.
- [ ] Deformation is disabled under `prefers-reduced-motion`; the static layout and state remain
      correct.
- [ ] On touch, `touch-action` follows the drag axis (x → `pan-y`, y → `pan-x`, both → `none`).
      Drag-to-open (Select) stays dormant until a 450ms hold and drag-to-flip (Switch) until 250ms:
      before it, movement past 8px cancels the press and the page keeps native scrolling; only the
      armed gesture adds the non-passive `touchmove` guard. Clicks and keyboard activation are
      unaffected. Press phases come from `createGestureMachine` in `@ilovecode33/ui-core`
      (`idle → pressing → armed → dragging`); components react to `onGesture` snapshots instead of
      keeping their own timers and listener pairs.
- [ ] The state model and semantics live in `@ilovecode33/ui-core`; the React renderer only maps
      them to styles.
- [ ] Modal sheet lifecycle (`closed → opening → open ⇄ dragging → settling / closing → closed`)
      lives in `createSheetMachine` in `@ilovecode33/ui-core` (built on
      `@ilovecode33/state-machine`); `Sheet` maps `data-phase` to styles instead of keeping separate
      boolean flags and DOM attributes.
- [ ] Never toggle `animation: none` on a transient interactive state of an element that has a
      default mount `@keyframes` animation — removing the state replays the entrance animation and
      overrides `transform` transitions. Scope entrance `@keyframes` to a one-shot `opening` phase
      that cannot be re-entered from interactive states.
- [ ] A SwiftUI counterpart is recorded on the contract (material plus spring).

---
