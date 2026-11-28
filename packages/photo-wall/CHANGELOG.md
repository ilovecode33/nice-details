# Changelog

## 0.3.0

### Minor Changes

- 95ae1f6: Build the remaining workspace libraries in bundleless (transform) mode so per-module imports are preserved. Photo wall no longer exposes a separate `styles.css` subpath; its component CSS Modules ship with the component imports.

## 0.2.1

### Patch Changes

- 73ae073: Refresh README.md for every workspace with concise, current summaries and verified documentation links.

## 0.2.0

### Minor Changes

- Split PhotoWall into colocated component files with structural snapshots; extract WallImageSlot and frameVars and add colocated algorithm specs.

All notable changes to `@ilovecode33/photo-wall` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-11-26

### Added

- Initial extraction of the endless Photo Wall into a standalone library, with a
  seedable pure tile generator and a React renderer that loops seamlessly via a
  mirrored tile strip.
- Pure solvers for frame geometry, virtual-light shadows (including multi-light
  superposition and wall glows), and per-frame tile styling, usable without
  React or the DOM.
- Colocated Rstest algorithm specs and structural snapshots covering the solvers
  and both React components.
- CSS Modules for component styles, exported through a `styles.css` entry point
  and a stable `data-wall-frame` hook for querying frames.

### Changed

- Split the React layer into `src/components/` (`PhotoWall` and
  `WallImageSlot`), factoring frame variables and the geometry/light/tiles
  helpers into their own files.
