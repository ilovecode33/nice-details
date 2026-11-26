---
'@ilovecode33/ui': patch
---

Keep the DockNavigation content locked to its target layout width during the expand/collapse morph, so the wrapped row count no longer cascades (for example 3 rows → 2 → 1) and the height no longer rises before settling to a single row.
