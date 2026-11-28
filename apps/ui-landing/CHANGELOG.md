# Changelog

## 0.1.4

### Patch Changes

- Updated dependencies [3711753]
  - @ilovecode33/ui@0.5.0
  - @ilovecode33/ui-types@0.5.0

## 0.1.3

### Patch Changes

- Updated dependencies [95ae1f6]
- Updated dependencies [95ae1f6]
- Updated dependencies [95ae1f6]
- Updated dependencies [95ae1f6]
- Updated dependencies [95ae1f6]
  - @ilovecode33/ui-types@0.4.0
  - @ilovecode33/photo-wall@0.3.0
  - @ilovecode33/ui@0.4.0

## 0.1.2

### Patch Changes

- cdaf137: Refresh the hero as a quiet editorial layout with an ambient accent wash, move preference controls below the actions, and keep the floating dock out of the fullscreen hero.
- 73ae073: Refresh README.md for every workspace with concise, current summaries and verified documentation links.
- 9de4e1d: Restore the saved scroll position before React mounts so a refresh never flashes the hero first.
- b38cb4d: Serve cached HTML immediately and revalidate in the background, and lazy-load all below-the-fold component demos so the hero paints first.
- 8dd91e1: Lazy-load the Photo Wall demo behind an IntersectionObserver with an idle prefetch, and register a production service worker so repeat opens serve cached assets.
- c9ac7b1: Add PR-only Cloudflare Pages preview deploys and document the intended ui.ilovecode33.fyi production domain without enabling production deployment yet.
- fe5a92f: Preserve the exact scroll position across refreshes of the lazy-loaded component details.
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
  - @ilovecode33/ui-types@0.3.2
  - @ilovecode33/photo-wall@0.2.1

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
