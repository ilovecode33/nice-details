---
'@ilovecode33/ui': minor
---

Build the library in bundleless (transform) mode so each component's CSS Module import is preserved for consumers. The aggregate `index.css` export is removed, and `UIFoundation` now loads the global `styles.css` (tokens + base) internally; apps no longer import it themselves.
