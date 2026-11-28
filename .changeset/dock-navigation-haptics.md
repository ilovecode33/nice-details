---
"@ilovecode33/ui": patch
---

Add mobile haptic feedback to `DockNavigation` on slot-crossing pill drags, inactive item taps, and
collapse toggles (via `navigator.vibrate` and an iOS 17.4+ switch fallback).
