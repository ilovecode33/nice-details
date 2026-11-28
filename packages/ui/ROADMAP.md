# @ilovecode33/ui — Roadmap

Expansion plan for the shared UI library. This file is for developers and agents. Design principles,
entry/exit criteria, and agent rules live only in the
[rule documents](../../packages/ai-rules/README.md) and [AGENTS.md](../../AGENTS.md); every item
below inherits them, so they are not repeated here.

Status labels: `planned` → `in progress` → `done` → `deferred`.

---

## 1. Where we are

Implemented across phases 0–5: `packages/ui` now exports 44 components (the original 14 plus
navigation, list, form, feedback, overlay, and media components) and Theme/Accent providers and
switchers. `apps/ui-landing` shows them in eight real **Component details** scenarios: upload
overview, settings, album library, create-album form, upload progress, photo gallery, empty search
result, and delete confirmation.

Original gaps, now closed:

- **Coverage**: navigation, lists, validated forms, transient feedback, and content/media components
  were missing. Each area now has a scenario on the landing page.
- **Portability**: design values lived only in `styles.css` and interaction state was embedded in
  React hooks. They now live in `@ilovecode33/ui-tokens` and `@ilovecode33/ui-core`, with a SwiftUI
  skeleton in `packages/ui-swift`.

Goals:

1. Grow the library by **complete scenarios**, not isolated widgets — every phase adds a real-use
   case to **Component details**.
2. Keep every addition behind the mobile-first and accessibility gates in the
   [mobile-first](../../packages/ai-rules/mobile-first.md),
   [user-first](../../packages/ai-rules/user-first.md),
   [component entry](../../packages/ai-rules/component-entry.md) and
   [release](../../packages/ai-rules/release-exit.md) rules, plus AGENTS.md §1–3.
3. Separate **semantics from rendering** so the same contracts can drive a future SwiftUI
   implementation without rewriting the design logic.

---

## 2. Platform-neutral architecture

The React package becomes one renderer of a shared design system, not the source of truth for it.

```text
ui-tokens (pure data)
   │  generates ──> styles.css · tokens.json · Tokens.swift
   ▼
ui-core (pure TS contracts + reducers; no React, no DOM)
   │
   ├──> ui        (React renderer) ──> apps/ui-landing "Component details"
   └──> ui-swift  (future SwiftUI renderer) ──> iOS app
```

| Package                          | Scope                                                                                                                                                                      | Runtime dependencies |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| `@ilovecode33/ui-tokens`         | Single source of truth for theme, accent palettes, spacing, radii, typography, motion, and touch sizes. Dev-time generators emit CSS variables, JSON, and Swift constants. | none                 |
| `@ilovecode33/ui-core`           | Framework-agnostic state models, reducers, semantics descriptors, and shared types. Plain TS, testable in Bun/Node.                                                        | none                 |
| `@ilovecode33/ui` (existing)     | Thin React adapters: props → `ui-core` state → ARIA + markup using generated tokens.                                                                                       | React peer deps only |
| `@ilovecode33/ui-swift` (future) | SwiftUI views built from the same contracts and generated `Tokens.swift`.                                                                                                  | not in this repo yet |

### The portable component contract

Every component is defined in `ui-core` by four framework-neutral parts:

- **State** — a serializable value plus a pure transition (`reduce(state, event) → state`).
  Examples: `SelectState` (`value`, `open`, `activeIndex`), `SheetState` (`presented`), `FieldState`
  (`value`, `touched`, `error`).
- **Events** — a closed set of platform-agnostic inputs: `select`, `move`, `dismiss`, `change`,
  `submit`. The web maps these to pointer/keyboard events; SwiftUI maps them to taps, gestures, and
  focus changes.
- **Semantics** — role and flags (`selected`, `checked`, `expanded`, `disabled`, `label`) that
  become ARIA attributes on the web and accessibility traits in SwiftUI.
- **Tokens and text** — token names resolved from `ui-tokens`, and text keys with English defaults
  supplied by the host app (the library stays i18n-free, per the
  [component entry rules](../../packages/ai-rules/component-entry.md)).

### Renderer mapping

| Contract in `ui-core` | React (`ui`)           | SwiftUI (`ui-swift`)                           |
| --------------------- | ---------------------- | ---------------------------------------------- |
| `ToggleState`         | `Switch`               | `Toggle`                                       |
| `SelectionState<T>`   | `Segmented`, `Select`  | `Picker` (segmented), `Menu`                   |
| `DisclosureState`     | new `Disclosure`       | `DisclosureGroup`                              |
| `SheetState`          | `Sheet`                | `.sheet` with detents                          |
| `FormFieldState`      | new `FormField`        | `Field` with `@FocusState`                     |
| `ListState<T>`        | new `List` / `ListRow` | `List`                                         |
| `FeedbackState`       | new `Toast`, `Banner`  | custom overlay with accessibility announcement |

### Migration rules

- Define the contract in `ui-core` **before** the React renderer for any new component.
- Refactors must not change the public props of existing `ui` components, and must keep the
  `gallery.theme` / `gallery.accent` storage keys unchanged.
- Document the intended SwiftUI counterpart on the contract type even before `ui-swift` exists, so
  parity is a type-level decision rather than a later guess.
- Generators are dev-time scripts only; no runtime dependency is added to any package.

---

## 3. Phased expansion

Phases 0 and 1 can overlap once the contract shape is agreed. Every phase adds its scenario to
**Component details** in `apps/ui-landing/src/main.tsx` and adds text to all three locales in
`apps/ui-landing/src/i18n.ts` (`en`, `zh-TW`, `de`).

### Phase 0 — Foundation (`done`)

- Extract the CSS custom properties from `styles.css` into `@ilovecode33/ui-tokens`; generators must
  reproduce the current token values exactly, plus emit `tokens.json` and a `Tokens.swift` draft.
- Create `@ilovecode33/ui-core` and migrate `Switch`, `Segmented`, `Select`, and `Sheet` state into
  reducers and semantics descriptors as proof of the pattern.
- Leave the `ui` public API and the landing page visually unchanged.
- **Done when**: `bunx turbo run typecheck build` is green and the four existing scenarios are
  unchanged at 375px and 1280px.

### Phase 1 — Navigation and lists (`done`)

- **Add**: `NavBar`, `TabBar`, `List` / `ListRow`, `Disclosure`, `Divider`, `Badge`, `Chip`;
  contracts `ListState`, `DisclosureState`, `NavigationState`.
- **Scenario**: "Album library" — a list of albums with leading thumbnails, trailing badges, a fixed
  bottom tab bar, and a disclosure row that reveals details; selecting a row opens an existing
  `Sheet`.
- **Done when**: the list scrolls naturally at 375px with no horizontal overflow, the tab bar
  respects safe-area insets, and contracts live in `ui-core`.

### Phase 2 — Data entry and validation (`done`)

- **Add**: `FormField` (label, hint, error), `Checkbox`, `RadioGroup`, `TextArea`, `Stepper`,
  `NumberField`, `SearchBar`, `DatePicker`; contract `FormFieldState` with a shared validation
  result type.
- **Scenario**: "Create album" — a multi-field form that reuses `Field`, `Select`, `Switch`, and
  `SliderRow`, shows an inline error that is not color-only, and supports a cancellable submit.
- **Done when**: validation state is driven by `ui-core`, label/control association works with
  VoiceOver, and inputs do not trigger iOS Safari auto-zoom.

### Phase 3 — Feedback and overlays (`done`)

- **Add**: `Toast` (with an Undo action), `Banner`, `ActivityIndicator`, `Skeleton`, `ProgressBar`
  (replacing the `.ui-progress` utility class), `ActionSheet`, `AlertDialog`, `Popover`; contract
  `FeedbackState`.
- **Scenario**: "Upload in progress" — progress plus skeletons, then a success toast with Undo;
  upgrade the delete scenario from `Sheet` to `AlertDialog` with an explicit cancel.
- **Done when**: dismissible feedback never blocks the primary touch zone, destructive actions sit
  away from it, and motion stops under reduced-motion.

### Phase 4 — Content and media (`done`)

- **Add**: `AspectImage`, `PhotoGrid`, `PhotoViewer`, `Avatar`, `Thumbnail`, `Carousel`; contracts
  `MediaState` and `SelectionModeState`.
- **Scenario**: "Photo gallery" — a responsive grid, a viewer with swipe-to-dismiss, and a selection
  mode that opens an `ActionSheet`; reuses Phase 1's list patterns where applicable.
- **Done when**: no new runtime dependency was needed, the grid uses `minmax()`, and the viewer is
  reachable and dismissible by keyboard and touch.

### Phase 6 — Adaptive glass and gesture feedback (`done`)

- Add glass material tokens (`--glass-fill`, stroke, highlight, shadow, blur, saturation) plus
  spring/deformation motion tokens to `@ilovecode33/ui-tokens`, generating CSS, JSON, and Swift
  constants.
- Add `FloatingState` and `DeformState` contracts to `@ilovecode33/ui-core` with Swift mirrors.
- Add `GlassSurface`, `FloatingBar`, `FloatingFooter`, `Deformable`, and `useDeform` to
  `packages/ui`; Buttons and floating bars deform directionally on drag and spring back on release.
- Apply the same design language to the landing page: floating header, floating bottom dock, glass
  TOC, and glass demo surfaces.
- **Done when**: `bunx turbo run typecheck build` and `swift build` are green, reduced motion
  disables deformation, and the 375px / 1280px checks still pass.

### Phase 5 — Parity and audit (`done`)

- Full keyboard, VoiceOver, dynamic-type, dark-mode, five-accent, and reduced-motion pass across all
  scenarios.
- Publish a `ui-swift` skeleton: Swift enums/structs mirroring `ui-core` contracts, generated
  `Tokens.swift`, and SwiftUI views for at least Toggle, Segmented, List, and Sheet.
- **Done when**: every `ui-core` contract has a documented SwiftUI counterpart and the landing page
  still passes the 375px / 1280px checks.

---

## 4. Per-component definition of done

In addition to the [component entry](../../packages/ai-rules/component-entry.md) and
[release exit](../../packages/ai-rules/release-exit.md) rules, a component is complete only when:

- [ ] Its state transitions and semantics are implemented in `ui-core` and tested without React.
- [ ] Its React renderer contains no business rules — only props → contract → markup.
- [ ] It consumes token names from `@ilovecode33/ui-tokens`; no hardcoded design values.
- [ ] Its intended SwiftUI counterpart is recorded on the contract type.
- [ ] It appears in a real-use **Component details** scenario, with text in all three locales.
- [ ] It passes the [mobile-first](../../packages/ai-rules/mobile-first.md) and
      [user-first](../../packages/ai-rules/user-first.md) rules and the 375px / 1280px checks in
      [release exit](../../packages/ai-rules/release-exit.md).

---

## 5. Compatibility constraints

Invariants the phases must not break. The rules behind them live in `packages/ai-rules/` and
AGENTS.md and are not repeated here.

- Public props of existing `ui` components, `defaultTheme` / `defaultAccent` overrides, and the
  `gallery.theme` / `gallery.accent` storage keys stay unchanged.
- App `tsconfig.json` path mappings to library `src` keep working, so no library build is required
  before hot reload.
- `@ilovecode33/ui-core` and `@ilovecode33/ui-tokens` stay free of runtime dependencies so a native
  client can mirror them without pulling in React.
- Library text stays prop-driven with English defaults; localization remains app-level (`en`,
  `zh-TW`, `de`).

---

## 6. Deferred

- Data visualization / charts — no current consuming scenario.
- Rich-text editing — owned by `@ilovecode33/editor-core`, not this library.
- Hover-only patterns and decorative animation.
- Component-level i18n packages or translation bundles inside `packages/ui`.
- A native renderer before its contracts exist in `ui-core`.

---

## 7. Tracking

| Phase | Focus                               | Status |
| ----- | ----------------------------------- | ------ |
| 0     | Tokens + contracts extracted        | `done` |
| 1     | Navigation and lists                | `done` |
| 2     | Data entry and validation           | `done` |
| 3     | Feedback and overlays               | `done` |
| 4     | Content and media                   | `done` |
| 5     | SwiftUI parity and audit            | `done` |
| 6     | Adaptive glass and gesture feedback | `done` |
