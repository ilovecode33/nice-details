---
'@ilovecode33/ui': patch
---

Re-base the Segmented settle animation against the new slot seat. Releasing a drag at the last boundary no longer throws the pill off-screen and springs it back: the inner offset is now computed so the pill stays exactly where the pointer left it while the outer seat snaps to the target, and mid-slot releases still glide smoothly into place.
