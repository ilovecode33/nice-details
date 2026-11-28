# Changelog

## 0.2.0

### Minor Changes

- 95ae1f6: Add a personal, frontend-only OKR tracker and its shared domain package. The app uses CSS Modules, keeps each component's style and spec beside it, persists through the IndexedDB-backed `@ilovecode33/persistence` library, groups objectives into quarter buckets such as `2026 Q4`, listing an objective under every quarter its dates touch, with a quick 2-month preset and a day/percent countdown; remembers the quarter and sort filters across visits, ships English, Traditional Chinese, and German UI, and syncs two devices in realtime through a Cloudflare Durable Object WebSocket room. Room state is end-to-end encrypted with AES-GCM; the room key stays in the URL fragment, so the Worker only stores and relays ciphertext. Concurrent edits merge per objective and per key result with deletion tombstones instead of overwriting the whole document. Each device has an editable, persisted name for the connected-device list. Stored documents, saved sync rooms, and Durable Object room records are versioned and read through migrations, with backups for unreadable data and no overwriting of newer formats.

### Patch Changes

- Updated dependencies [95ae1f6]
- Updated dependencies [95ae1f6]
- Updated dependencies [95ae1f6]
- Updated dependencies [95ae1f6]
- Updated dependencies [95ae1f6]
- Updated dependencies [95ae1f6]
- Updated dependencies [95ae1f6]
  - @ilovecode33/ui-types@0.4.0
  - @ilovecode33/okr-shared@0.2.0
  - @ilovecode33/ui@0.4.0
  - @ilovecode33/persistence@0.2.0

All notable changes to `@ilovecode33/okr-web` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-11-27

### Added

- Initial frontend-only personal OKR app with objective and key-result editing,
  progress summaries, period and sort filters, and confirmed destructive actions.
- Local persistence through `@ilovecode33/okr-shared`, with sample data on first
  visit and appearance controls from the shared UI library.
