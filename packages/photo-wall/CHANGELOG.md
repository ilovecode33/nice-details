# Changelog

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
