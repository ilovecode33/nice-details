---
'@ilovecode33/ui': patch
---

Extract the Segmented pill drag engine into a reusable `useSegmentPillDrag` hook (with a tunable `feel` for snap radius, dead zone, breakaway and magnet) and reuse it in the theme switcher, so the appearance control gets the same weighted drag and rebound-free settle with a smaller snap zone suited to its 44px icons. The theme pill uses the accent-tinted glass fill, stroke and halo so the selected option is clearly visible in both light and dark themes.
