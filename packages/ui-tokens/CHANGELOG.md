# Changelog

## 0.5.2

No changes in this release.

## 0.5.1

No changes in this release.

## 0.5.0

No changes in this release.

## 0.4.0

### Patch Changes

- 95ae1f6: Build the remaining workspace libraries in bundleless (transform) mode so per-module
  imports are preserved. Photo wall no longer exposes a separate `styles.css` subpath; its component
  CSS Modules ship with the component imports.

## 0.3.2

### Patch Changes

- 73ae073: Refresh README.md for every workspace with concise, current summaries and verified
  documentation links.

## 0.3.1

No changes in this release.

All notable changes to `@ilovecode33/ui-tokens` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0] - 2026-11-26

### Added

- Derived token recipes (`DERIVED`, `DERIVED_LIGHT`) and their CSS variable name maps, covering the
  background gradient, icon sizes, portal layer, dock and glow timing, and segmented/button halo
  mixes. Light-theme overrides keep white edges visible on light tracks.
- A `./styles.css` export pointing at `generated/styles.css`, so consumers can import the generated
  stylesheet directly.
- JSDoc for the exported palettes, surfaces, glass material, scales, safe-area tokens and generator
  functions, including the accepted color formats and the output of each renderer.

### Changed

- The generators now emit the derived recipes into all three outputs: CSS custom properties for
  light/dark/system themes (with `var()`/`color-mix()` left intact so runtime accent overrides still
  cascade), `tokens.json`, and a SwiftUI `Derived` enum in `Tokens.swift` that keeps the CSS recipes
  as raw strings.
- The package ships at `0.3.0`, matching the rest of the UI family so all `@ilovecode33/ui*`
  packages can be upgraded as one unit.
