# Design principles

Scope: Project-wide: every UI work.

Design reference: [Apple Human Interface Guidelines — Design Principles](https://developer.apple.com/design/human-interface-guidelines/design-principles)

> Core idea: **mobile-first, user-first, touch-first**.
> A component that only works with a mouse, hover, and a wide viewport does not belong in this library.

| HIG principle | Concrete requirement in this library |
|---|---|
| **Purpose** | One component, one job. Props stay within that job. Reject components whose purpose cannot be stated in one sentence. |
| **Agency** | Users can undo or leave: a Sheet closes via backdrop or ✕; forms never auto-submit. |
| **Responsibility** | State is visible and immediate: `aria-pressed` / `aria-checked` / `aria-selected` match the visuals. Errors are not communicated by color alone. |
| **Familiarity** | Use platform conventions (iOS-style segmented control, switch, bottom sheet). Button labels use verbs. |
| **Flexibility** | One component supports touch, mouse, keyboard, VoiceOver, and dynamic font sizes. |
| **Simplicity** | Minimal props; extend native HTML attributes. No boolean-flag explosion. |
| **Craft** | Use only design tokens from `styles.css`. No hardcoded colors, spacing, radii, or animation timings. |
| **Delight** | Motion exists only for state feedback and respects `prefers-reduced-motion`. No decorative animation. |
