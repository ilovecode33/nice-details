# Changelog

## 0.8.0

### Minor Changes

- 421dd21: Show the deployed latest app version when checking for updates, and wait for the user to choose Update now before reloading.
- de231cc: Detect new app versions automatically and let the user choose when to reload.

## 0.7.0

### Minor Changes

- fc3d129: Share the profile name through the sync room. It lives on the OKR document, so every device in the room shows the same dashboard title and the newer edit wins. A name saved only on this device by the previous release is copied into the document on the next load.

### Patch Changes

- Updated dependencies [fc3d129]
  - @ilovecode33/okr-shared@0.3.0

## 0.6.0

### Minor Changes

- cf7181e: Add a Profile setting for the user's name. The dashboard heading and document title become "<name>'s OKRs" (localized possessive), and the name is stored on the device through IndexedDB.

## 0.5.0

### Minor Changes

- 6225a31: Add an Updates row to the About card so installed PWAs and Safari home-screen bookmarks have an explicit refresh path: it checks the service worker on demand (and when the app becomes visible), shows "A new version is ready" when one is waiting, and reloads the app to apply it.

## 0.4.1

### Patch Changes

- 1819c1d: Joining a sync room now merges with the local document instead of replacing it, so an empty or partial room can no longer wipe a device that already has objectives. Only a fresh install still holding the untouched sample data adopts the room. Select menus wrapped in a label (quick length, unit, period, sort, accent) now close after choosing an option instead of reopening through the label's activation behavior.
- Updated dependencies [1819c1d]
  - @ilovecode33/ui@0.5.1
  - @ilovecode33/ui-tokens@0.5.1
  - @ilovecode33/ui-types@0.5.1

## 0.4.0

### Minor Changes

- 3711753: Make the app installable and add an Install card to Settings. The bottom dock is always minimized and a floating sync status chip sits to its left, opening the sync sheet; the status bar and browser chrome follow the resolved theme. A web manifest, maskable icons, an apple-touch-icon, and a network-first service worker make the app a standalone PWA; Chromium gets an "Add to Home Screen" button, iOS and other browsers get share/menu instructions, and an installed window shows "Installed".

### Patch Changes

- Updated dependencies [3711753]
  - @ilovecode33/ui@0.5.0
  - @ilovecode33/ui-tokens@0.5.0
  - @ilovecode33/ui-types@0.5.0

## 0.3.0

### Minor Changes

- ac9c746: Move the app onto a three-page bottom-navigation shell: **Dashboard**, **OKRs**, and **Settings**. The dashboard shows the summary and the objectives that are active today; the OKR list keeps the quarter filter, sort, and editing actions. Language, appearance, and sync move from the header into Settings, which opens the sync sheet from a single row.

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
