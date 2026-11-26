# Mobile-first

Scope: Project-wide: every UI work.

- Base CSS targets a phone; desktop enhancements only in `@media (min-width: 768px)`.
- Single-column / stacked layouts, no fixed widths. Use `var(--space-*)` and `minmax()`.
- No horizontal scrolling at 375px.
- Every interactive element is at least 44 × 44 pt (`var(--touch)`), including icon buttons, switches, and segmented items.
- Use `env(safe-area-inset-*)` for safe areas via the `--safe-*` tokens.
- Form inputs are at least 16px so iOS Safari does not auto-zoom.
