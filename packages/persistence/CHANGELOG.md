# Changelog

## 0.2.0

### Minor Changes

- 95ae1f6: Add an IndexedDB-backed persistence library with typed key-value and table stores.

All notable changes to `@ilovecode33/persistence` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-11-27

### Added

- IndexedDB-backed typed key-value store with `get`, `set`, `delete`, `clear`,
  `has`, `count`, `keys`, and `entries`.
- IndexedDB-backed table store with `add`, `put`, `get`, `delete`, `clear`,
  `has`, `count`, `getAll`, `getAllKeys`, and index queries.
- Additive schema upgrades, optional `autoIncrement`, secondary indexes, and an
  `onUpgrade` hook.
- Injectable `IDBFactory` for tests and non-browser runtimes, plus
  `PersistenceError` with the original DOMException as `cause`.
