# Changelog

## 0.1.3

### Patch Changes

- Updated dependencies [95ae1f6]
  - @ilovecode33/editor-core@0.1.3

## 0.1.2

### Patch Changes

- 73ae073: Refresh README.md for every workspace with concise, current summaries and verified
  documentation links.
- Updated dependencies [73ae073]
  - @ilovecode33/editor-core@0.1.2

## 0.1.1

### Patch Changes

- Updated dependencies
  - @ilovecode33/editor-core@0.1.1

All notable changes to the internal app `@ilovecode33/editor-app` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-11-21

### Added

- Initial internal WYSIWYG demo built on `@ilovecode33/editor-core` via `createEditor`, seeded with
  sample HTML and focused on load.
- Toolbar commands for bold, italic and H1–H3 headings, with `is-active` and `aria-pressed` state
  synced from `onStateChange` and the editor selection kept when a button is pressed.
- Live output panel showing the current HTML and a character count updated on every `onChange`, with
  a safe fallback for the empty state.
