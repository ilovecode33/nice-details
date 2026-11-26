# Changelog

## 0.1.1

### Patch Changes

- Updated dependencies
- Updated dependencies
  - @ilovecode33/ui@0.3.1
  - @ilovecode33/photo-wall@0.2.0
  - @ilovecode33/ui-types@0.3.1

All notable changes to the internal app `@ilovecode33/ui-landing` are documented
in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-11-26

### Added

- Internal component gallery for `@ilovecode33/ui`, with a table of contents
  generated from a single `COMPONENT_GROUPS` source of truth and demo cards that
  show components in real usage scenarios rather than isolated showcases.
- Interactive Photo Wall demo built on the real `@ilovecode33/photo-wall`
  renderer: drag or arrow-key virtual lights, adjust frame depth, light height
  and softness, and reset the scene.
- Localized user-facing copy in `en` (default), `zh-TW` and `de` through the
  app-level i18n module.

### Changed

- Demos rely on stable `data-ui` slots instead of hashed class names, so the
  gallery keeps working across library styling refactors.
