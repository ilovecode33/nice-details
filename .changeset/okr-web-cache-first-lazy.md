---
"@ilovecode33/okr-web": patch
---

Speed up `okr-web` cold launches with Cache-First static asset caching, Stale-While-Revalidate HTML
navigation (refreshing cached HTML before manual updates), Cloudflare Pages `_headers`, and
`React.lazy` code-splitting for `ObjectiveCard`, `ObjectiveEditor`, `SyncPanel`, `QrCode`, and
`QrScanner`.
