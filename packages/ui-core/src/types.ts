/**
 * Shared, framework-neutral vocabulary for UI components.
 *
 * No React, no DOM. Renderers map `Semantics` to ARIA on the web and to
 * accessibility traits in SwiftUI; `UiEvent` maps to pointer/keyboard events
 * on the web and gestures/focus changes in SwiftUI.
 */

export type { UiRole, Semantics, PortableComponent, UiEvent } from '@ilovecode33/ui-types';
