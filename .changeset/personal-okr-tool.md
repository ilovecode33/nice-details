---
'@ilovecode33/okr-shared': minor
'@ilovecode33/okr-web': minor
---

Add a personal, frontend-only OKR tracker and its shared domain package. The app uses CSS Modules, keeps each component's style and spec beside it, persists through the IndexedDB-backed `@ilovecode33/persistence` library, groups objectives into quarter buckets such as `2026 Q4`, listing an objective under every quarter its dates touch, with a quick 2-month preset and a day/percent countdown; remembers the quarter and sort filters across visits, ships English, Traditional Chinese, and German UI, and syncs two devices in realtime through a Cloudflare Durable Object WebSocket room. Room state is end-to-end encrypted with AES-GCM; the room key stays in the URL fragment, so the Worker only stores and relays ciphertext. Concurrent edits merge per objective and per key result with deletion tombstones instead of overwriting the whole document. Each device has an editable, persisted name for the connected-device list. Stored documents, saved sync rooms, and Durable Object room records are versioned and read through migrations, with backups for unreadable data and no overwriting of newer formats.
