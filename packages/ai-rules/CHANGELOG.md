# Changelog

## 0.1.3

### Patch Changes

- 95ae1f6: Add frontend project conventions for CSS Modules and same-name component, style, and test
  files.

## 0.1.2

### Patch Changes

- 1a91833: Update the git workflow rule now that the repository is public and main branch protection
  is enabled.
- 11e1e84: Add the no-direct-push-to-main workflow rule and a local pre-push guard.
- 73ae073: Refresh README.md for every workspace with concise, current summaries and verified
  documentation links.

## 0.1.1

### Patch Changes

- Split the project quality rules into per-topic Markdown documents and add rules for photo-wall and
  editor-core.

All notable changes to `@ilovecode33/ai-rules` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-11-26

### Added

- Internal workspace (private, not published to npm) holding the project's AI rules as plain
  Markdown documents split by topic and indexed from its `README.md`.
- Rules for design principles, mobile-first, user-first/touch-first, floating surfaces, component
  entry and release exit criteria, deprecation, and a PR checklist.
- Package-specific rule files for `@ilovecode33/photo-wall` and `@ilovecode33/editor-core`.
- `AGENTS.md` now points to this workspace instead of duplicating rule content.
