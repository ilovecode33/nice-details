# Changelog

All notable changes to `@ilovecode33/ui` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
