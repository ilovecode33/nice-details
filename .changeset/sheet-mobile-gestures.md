---
"@ilovecode33/ai-rules": patch
"@ilovecode33/okr-web": patch
"@ilovecode33/ui": patch
---

Move `Sheet` lifecycle and drag-to-dismiss gestures to `createSheetMachine` in
`@ilovecode33/ui-core`, scope entrance `@keyframes` to the one-shot `opening` phase so drag release
never replays the entrance animation, document the state-machine/animation rules, and resolve
`@ilovecode33/*` workspace packages from built `dist` in `okr-web`.
