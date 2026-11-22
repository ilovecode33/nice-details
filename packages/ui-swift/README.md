# @ilovecode33/ui-swift (skeleton)

SwiftUI counterpart of `@ilovecode33/ui`. It is not an npm workspace package —
it is a Swift package that consumes the same platform-neutral contracts and
generated tokens as the React renderer.

```text
@ilovecode33/ui-tokens  ──generates──>  Sources/UISwift/Tokens.swift
@ilovecode33/ui-core    ──mirrored by──>  Sources/UISwift/Contracts.swift
                                         Sources/UISwift/Views.swift
```

## Build

```bash
swift build --package-path packages/ui-swift
```

## Contents

- `Contracts.swift` — Swift mirrors of the `ui-core` state models and reducers,
  plus a `portableContracts` registry documenting the SwiftUI counterpart of
  every contract (including ones without a view yet).
- `Views.swift` — SwiftUI views for the first four contracts: `UIToggle`,
  `UISegmented`, `UIListView`, and `UISheetView`.
- `Tokens.swift` — generated from `@ilovecode33/ui-tokens`; do not edit by hand.

## Regenerating tokens

```bash
cd packages/ui-tokens
bun run generate
cp generated/Tokens.swift ../ui-swift/Sources/UISwift/Tokens.swift
```

## Parity map

| Contract (`ui-core`) | React (`ui`) | SwiftUI (`ui-swift`) |
|---|---|---|
| `ToggleState` | `Switch` | `Toggle` (`UIToggle`) |
| `SelectionState<T>` | `Segmented`, `Select` | `Picker` / `Menu` (`UISegmented`) |
| `DisclosureState` | `Disclosure` | `DisclosureGroup` |
| `SheetState` | `Sheet` | `.sheet` with detents (`UISheetView`) |
| `FieldState` | `FormField` | `Field` with `@FocusState` |
| `ListState<T>` | `List` | `List` (`UIListView`) |
| `FeedbackState` | `Toast`, `Banner` | overlay with accessibility announcement |
| `MediaState` | `PhotoViewer` | `TabView` with page style |
| `SelectionModeState` | `PhotoGrid` selection | `EditMode` / selection |
| `NavigationState` | `TabBar` | `TabView` |
