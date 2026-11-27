# Changelog

## 0.3.2

### Patch Changes

- 73ae073: Refresh README.md for every workspace with concise, current summaries and verified documentation links.
- Updated dependencies [73ae073]
  - @ilovecode33/ui-types@0.3.2

## 0.3.1

### Patch Changes

- @ilovecode33/ui-types@0.3.1

All notable changes to `@ilovecode33/ui-core` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0] - 2026-11-26

### Added

- Rstest coverage for the framework-neutral contracts: deformation, floating
  and toggle reducers each have a spec, with a Node-only `rstest.config.ts` and
  a `test` script.
- JSDoc for the public contracts and helpers. The rubber-band resistance curve
  and the gesture/selection state fields now state their inputs, outputs and
  non-obvious invariants explicitly.

### Changed

- Portable contract state, event and prop types now come from
  `@ilovecode33/ui-types` instead of the package's local `types.ts`; the local
  type module was removed from the public entry point.
- The package ships at `0.3.0`, matching the rest of the UI family so all
  `@ilovecode33/ui*` packages can be upgraded as one unit.
