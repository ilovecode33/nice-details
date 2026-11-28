# Changelog

All notable changes to `@ilovecode33/okr-shared` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-11-27

### Added

- Initial framework-neutral OKR domain model with key results, objectives,
  periods, weights, and a versioned persisted state.
- Pure calculations for id creation, clamping, key result, objective, and
  overall progress, value formatting, sorting, and period collection.
- Deterministic sample data and validated `localStorage` load/save helpers that
  never throw.
