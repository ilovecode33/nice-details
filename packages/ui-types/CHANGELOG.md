# Changelog

## 0.3.2

### Patch Changes

- 73ae073: Refresh README.md for every workspace with concise, current summaries and verified documentation links.
- Updated dependencies [73ae073]
  - @ilovecode33/ui-tokens@0.3.2

## 0.3.1

### Patch Changes

- @ilovecode33/ui-tokens@0.3.1

All notable changes to `@ilovecode33/ui-types` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0] - 2026-11-26

### Added

- Initial package of shared, framework-portable types, grouped by domain:
  appearance, deformation, disclosure, feedback, fields, floating surfaces,
  foundation, lists, media, navigation, primitives, selection, sheets, toggles
  and ARIA semantics. Each module exposes the state, event and prop types for
  its domain.
- Theme, accent and foundation contracts that reference the `Accent` union
  from `@ilovecode33/ui-tokens`, with JSDoc for the resolved theme, controlled
  locale and dictionary fields.
- JSDoc on public prop types for non-obvious behavior, such as directional
  deformation under reduced motion, the anchor-positioning requirement for
  halo portals, and anchors in dock items.

### Changed

- These types replace the local `types.ts` module previously shipped by
  `@ilovecode33/ui-core`; consumers should import them from
  `@ilovecode33/ui-types` instead.
- The package ships at `0.3.0`, matching the rest of the UI family so all
  `@ilovecode33/ui*` packages can be upgraded as one unit.
