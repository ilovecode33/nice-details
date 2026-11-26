---
'@ilovecode33/ui': patch
---

Add drag-to-toggle to Switch: the knob follows the pointer with a liquid stretch, previews the destination track colour, and commits the side it lands on when released. Sub-threshold presses and plain clicks still toggle, and the synthetic click after a drag is suppressed so it cannot double-toggle. The on track now uses the same accent glass as the pill (`--seg-thumb-solid`), so it no longer looks darker by compositing against the page background.
