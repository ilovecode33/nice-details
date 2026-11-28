# Changelog

## 0.1.3

### Patch Changes

- Updated dependencies [95ae1f6]
- Updated dependencies [95ae1f6]
- Updated dependencies [95ae1f6]
- Updated dependencies [95ae1f6]
- Updated dependencies [95ae1f6]
  - @ilovecode33/editor-core@0.1.3
  - @ilovecode33/ui@0.4.0

## 0.1.2

### Patch Changes

- 73ae073: Refresh README.md for every workspace with concise, current summaries and verified documentation links.
- Updated dependencies [a6d7829]
- Updated dependencies [73ae073]
- Updated dependencies [a6d7829]
- Updated dependencies [430d577]
- Updated dependencies [2295ad4]
- Updated dependencies [a6d7829]
- Updated dependencies [c85cbdf]
- Updated dependencies [a6d7829]
- Updated dependencies [851dfe1]
- Updated dependencies [5f303cc]
- Updated dependencies [a6d7829]
  - @ilovecode33/ui@0.3.2
  - @ilovecode33/editor-core@0.1.2

## 0.1.1

### Patch Changes

- Updated dependencies
- Updated dependencies
  - @ilovecode33/ui@0.3.1
  - @ilovecode33/editor-core@0.1.1

All notable changes to the internal app `@ilovecode33/blog` are documented in
this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-11-25

### Added

- Initial internal blog as a React Router single-page app with Posts and About
  routes, wrapped in `UIFoundation` so surfaces, controls and motion come from
  the shared design tokens.
- Reusable `DockNavigation` for site navigation: a collapsed-by-default dock
  with real `href`s for accessibility and router-driven selection.
- Readonly article rendering through the `createEditor` SDK, with a visible
  Readonly mode badge and cleanup on unmount.

### Changed

- Static assets are now cached by Cloudflare Pages through a declarative
  `public/_headers` rule instead of the zone API: hashed `/static/*` files get a
  one-year immutable cache, while HTML is left unmatched so every deployment
  serves fresh markup.
