# User-first / touch-first

Scope: Project-wide: every UI work.

- Primary actions sit within thumb reach; destructive actions stay away from the main touch zone.
- No feature depends on hover; hover is a bonus only.
- Every interaction gives immediate feedback (`:active` plus synced ARIA state).
- Data-losing operations must be undoable or cancellable.
- Keyboard parity: sensible Tab order, a 2px accent `:focus-visible` ring, Enter/Space activation.
- Text contrast ≥ 4.5:1; support dark mode and dynamic font sizes.
- Respect `prefers-reduced-motion`.

---
