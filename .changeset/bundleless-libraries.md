---
'@ilovecode33/ui-core': patch
'@ilovecode33/ui-tokens': patch
'@ilovecode33/ui-types': patch
'@ilovecode33/photo-wall': minor
'@ilovecode33/editor-core': patch
'@ilovecode33/okr-shared': patch
---

Build the remaining workspace libraries in bundleless (transform) mode so per-module imports are preserved. Photo wall no longer exposes a separate `styles.css` subpath; its component CSS Modules ship with the component imports.
