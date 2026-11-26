# Changelog

## 0.1.1

### Patch Changes

- Add Rstest coverage for the createEditor contract and document the SDK API.

All notable changes to `@ilovecode33/editor-core` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-11-26

### Added

- Initial release of the framework-agnostic Lexical SDK, exposing `createEditor`
  and typed controller/state contracts.
- Synchronous HTML/text commits: `setHTML` uses a discrete Lexical update so
  `getHTML()` and `getText()` observe the new state immediately, including during
  creation with `initialHTML`, and getters read committed state synchronously.
- Rich-text editing with bold, italic and h1–h3 headings, undo/redo history,
  readonly mode, `onChange`/`onStateChange` reporting, and `destroy` cleanup.
- Colocated Rstest coverage (`editor.spec.ts`) next to the SDK source.
