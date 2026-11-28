---
'@ilovecode33/ui': minor
---

Require a 450ms touch hold before drag gestures arm on Select and Switch, so swiping the page over a control scrolls it instead of opening the menu or flipping the switch. Before the hold, movement past 8px cancels the press; mouse drags, taps, and keyboard activation are unchanged. `Deformable` and `useDeform` accept `longPressMs` for the same behavior.
