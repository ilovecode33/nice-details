# Changelog

## 0.5.1

### Patch Changes

- 1819c1d: Joining a sync room now merges with the local document instead of replacing it, so an empty or partial room can no longer wipe a device that already has objectives. Only a fresh install still holding the untouched sample data adopts the room. Select menus wrapped in a label (quick length, unit, period, sort, accent) now close after choosing an option instead of reopening through the label's activation behavior.
- @ilovecode33/ui-core@0.5.1
  - @ilovecode33/ui-tokens@0.5.1
  - @ilovecode33/ui-types@0.5.1

## 0.5.0

### Minor Changes

- 3711753: `DockNavigation` reuses the appearance switcher's `useSegmentPillDrag` engine: a sliding accent pill sits behind the active item, dragging it follows the pointer with the same damping and settles onto the nearest item, and releasing selects that item. Clicking another item still slides the pill there. The active item is marked in both the expanded and collapsed layouts.

### Patch Changes

- @ilovecode33/ui-core@0.5.0
  - @ilovecode33/ui-tokens@0.5.0
  - @ilovecode33/ui-types@0.5.0

## 0.4.0

### Minor Changes

- 95ae1f6: Add `@ilovecode33/state-machine`, a minimal typed state machine (states, events, guards, actions; no interpreter, timers, or runtime dependencies), and move press handling onto it. `ui-core` exposes `createGestureMachine` (`idle → pressing → armed → dragging`) with long-press and scroll-handoff guards; `useDeform`/`Deformable` drive it from pointer events and report `onGesture` snapshots. `Select` and `Switch` consume those snapshots instead of keeping their own long-press timers, document listeners, pointer capture, and click suppression. The Switch arms after 250ms (the Select keeps 450ms), and `Field` captions no longer activate a Select or Switch inside them when clicked.
- 95ae1f6: Build the library in bundleless (transform) mode so each component's CSS Module import is preserved for consumers. The aggregate `index.css` export is removed, and `UIFoundation` now loads the global `styles.css` (tokens + base) internally; apps no longer import it themselves.
- 95ae1f6: Add English-default `closeLabel`, `decreaseLabel`, and `increaseLabel` props to Sheet and Stepper so consuming apps can localize their accessibility labels.
- 95ae1f6: Require a 450ms touch hold before drag gestures arm on Select and Switch, so swiping the page over a control scrolls it instead of opening the menu or flipping the switch. Before the hold, movement past 8px cancels the press; mouse drags, taps, and keyboard activation are unchanged. `Deformable` and `useDeform` accept `longPressMs` for the same behavior.

### Patch Changes

- Updated dependencies [95ae1f6]
- Updated dependencies [95ae1f6]
  - @ilovecode33/ui-core@0.4.0
  - @ilovecode33/ui-tokens@0.4.0
  - @ilovecode33/ui-types@0.4.0

## 0.3.2

### Patch Changes

- a6d7829: Keep the DockNavigation content locked to its target layout width during the expand/collapse morph, so the wrapped row count no longer cascades (for example 3 rows → 2 → 1) and the height no longer rises before settling to a single row.
- 73ae073: Refresh README.md for every workspace with concise, current summaries and verified documentation links.
- a6d7829: Extract the Segmented pill drag engine into a reusable `useSegmentPillDrag` hook (with a tunable `feel` for snap radius, dead zone, breakaway and magnet) and reuse it in the theme switcher, so the appearance control gets the same weighted drag and rebound-free settle with a smaller snap zone suited to its 44px icons. The theme pill uses the accent-tinted glass fill, stroke and halo so the selected option is clearly visible in both light and dark themes.
- 430d577: Move the whole Segmented pill surface onto the inner drag layer so the damped pill, glow and spotlight track the pointer together without stacking across repeated drags.
- 2295ad4: Hard-clamp Segmented drags at the end slots and skip the settle animation when an end-clamped release keeps the same selection, removing the endpoint rebound.
- a6d7829: Re-base the Segmented settle animation against the new slot seat. Releasing a drag at the last boundary no longer throws the pill off-screen and springs it back: the inner offset is now computed so the pill stays exactly where the pointer left it while the outer seat snaps to the target, and mid-slot releases still glide smoothly into place.
- c85cbdf: Give the Segmented thumb a weighted drag: heavy breakaway at the start of a drag, smooth 1:1 tracking once the pointer leaves the slot, a light magnet on entry, rubber-band resistance at the ends, and a spring settle window after release.
- a6d7829: Let the Select menu be chosen by dragging: sliding the pointer over options highlights the option under it, and releasing applies that option and closes the menu — including when the gesture starts on the trigger, so press-drag-release selects in one motion. Once the menu is open its drop side is locked, so a later opposite drag cannot flip it.
- 851dfe1: Detect drag direction intent on Select: horizontal-dominant drags no longer open or flip the dropdown.
- 5f303cc: Open Select by dragging vertically: drag up opens the menu above the trigger, drag down opens it below, with click suppression after a drag and matching keyboard directions.
- a6d7829: Add drag-to-toggle to Switch: the knob follows the pointer, previews the destination track colour, and commits the side it lands on when released. The knob stretch peaks halfway and rounds back to a circle at each seat, so it only deforms while crossing the middle. Sub-threshold presses and plain clicks still toggle, and the synthetic click after a drag is suppressed so it cannot double-toggle. The on track now uses the same accent glass as the pill (`--seg-thumb-solid`), so it no longer looks darker by compositing against the page background.
- Updated dependencies [73ae073]
  - @ilovecode33/ui-core@0.3.2
  - @ilovecode33/ui-tokens@0.3.2
  - @ilovecode33/ui-types@0.3.2

## 0.3.1

### Patch Changes

- Colocate structural snapshots with each component spec and document every component, hook and portable contract.
- @ilovecode33/ui-core@0.3.1
  - @ilovecode33/ui-tokens@0.3.1
  - @ilovecode33/ui-types@0.3.1

All notable changes to `@ilovecode33/ui` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- Component snapshots now live in each component's own `<Component>.spec.tsx`
  instead of one central suite. Rstest writes one
  `__snapshots__/<Component>.spec.tsx.snap` per component via the shared
  `src/test-utils/snapshot.ts` helper; every component keeps exactly one
  structural snapshot.

## [0.3.0] - 2026-11-26

### Changed

- `@ilovecode33/ui`, `@ilovecode33/ui-core`, `@ilovecode33/ui-tokens` and
  `@ilovecode33/ui-types` now ship at the same version (`0.3.0`), so the UI
  family can be upgraded as one unit.
- **Breaking:** all CSS custom properties, including derived recipes (icon
  sizes, glow timings, segmented/button halo mixes, background gradient), are
  now generated by `@ilovecode33/ui-tokens`, which also exposes
  `@ilovecode33/ui-tokens/styles.css`. `ui/styles.css` imports the generated
  sheet; the published `dist/styles.css` inlines it at build time. Consumers
  that hand-maintained a copy of the token block should switch to the
  generated stylesheet.

### Added

- JSDoc for every public component, hook and portable contract. Complex
  algorithms — drag resistance and gesture state, selection/keyboard reducers,
  Photo Wall geometry and lighting solves, and the token generators — now state
  their inputs, outputs and non-obvious invariants explicitly.
- Structural Rstest snapshots for every component in
  `src/components/component-snapshots.spec.tsx`, covering roles, ARIA, `data-ui`
  slots and CSS Module classes. Generated ids and persisted provider state are
  normalized so unrelated renders do not churn the snapshots.
- Stable `data-ui` slots for every public styling hook (`data-ui="row"`,
  `data-ui="stack stack--md"`, `data-ui="console-topbar"`, …). The rules live in
  `styles.css` as `[data-ui~='...']` selectors, so attribute selectors are never
  hashed and consumers no longer need a class-name mapper.

### Removed

- **Breaking:** the public `cn()` export and the CSS Module lookup table in
  `src/styles/index.ts`. Consumers must replace `cn('ui-row')` with
  `data-ui="row"`; app-local class names stay in `className`.

## [0.2.0] - 2026-11-25

### Added

- `DockNavigation` active-item easing: the collapsed dock keeps the active item
  centered and now animates it into place when the selection changes, using the
  `--dock-scroll-dur` token. Reduced motion snaps immediately.
- A press-point liquid-glass bloom in the motion layer, driven by `useDeform()`
  and its `--glow-*` variables. It stays behind content, never takes focus, and
  is disabled under reduced motion.
- Glass interaction states for `Button` and `Segmented`: a tinted fill with a
  two-layer hover/active halo that eases in and out. The primary variant has a
  stronger accent fill so it remains visually dominant, and destructive buttons
  use the danger hue with the same glow treatment.
- `Segmented` drag and snap: the selected block is the drag surface, can be
  dragged freely, and snaps to the nearest slot on release. Clicking or using
  the keyboard slides the pill without a delayed highlight.
- Clipping-safe button halos via CSS Anchor Positioning: a portalled button is
  tethered to a transparent placeholder so its glow cannot be cut off by
  `Card`, scroll containers, or `Sheet` bodies. Requires a browser with anchor
  positioning support; unsupported browsers are intentionally not handled.
- `lucide-react` icons throughout the library — the theme switcher
  (`Monitor`/`Sun`/`Moon`), floating toggle (`ChevronUp`/`ChevronDown`),
  banners and status stats (`Check`/`X`/`Info`/`Minus`), and photo-grid
  selection (`Check`).
- New design tokens: `--icon-sm`, `--icon-md`, `--icon-lg` for icon sizing and
  `--z-portal` to raise portalled buttons above overlay stacks.

### Changed

- Repeated CSS recipes were consolidated into native custom properties instead
  of duplicated declarations.
- Added `lucide-react` as a runtime dependency. Icons were previously raw
  Unicode characters whose glyphs varied by platform font; tree-shaking keeps
  only the icons actually imported.

### Fixed

- Button hover glow is visible in both light and dark themes and no longer
  flashes when a slot is activated under a stationary pointer.
- The selected `Segmented` pill stays highlighted after a click; the delayed
  bloom on activation was removed.
- `Card` uses `overflow: clip` with `overflow-clip-margin` so button halos are
  not clipped.
- Portalled buttons sit above overlay stacks, so their glow is not hidden
  behind a `Sheet`.
- A drag beyond the click threshold, or a release outside the control, no
  longer fires the control's click handler.

## [0.1.0] - 2026-11-21

### Added

- Initial release of the adaptive React component library and its localized
  component gallery.
- Foundation, forms, feedback, media, navigation, floating surfaces,
  theme/accent switchers, and reduced-motion-aware deformation helpers, built
  on `ui-core` contracts and `ui-tokens` design tokens.
- `DockNavigation`, a reusable right-aligned floating dock with a collapsed
  state.
