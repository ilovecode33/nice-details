/**
 * Shared, framework-neutral vocabulary for UI components.
 *
 * No React, no DOM. Renderers map `Semantics` to ARIA on the web and to
 * accessibility traits in SwiftUI; `UiEvent` maps to pointer/keyboard events
 * on the web and gestures/focus changes in SwiftUI.
 */

export type UiRole =
  | 'button'
  | 'switch'
  | 'checkbox'
  | 'radio'
  | 'combobox'
  | 'option'
  | 'listbox'
  | 'list'
  | 'listitem'
  | 'dialog'
  | 'group'
  | 'navigation'
  | 'toolbar'
  | 'textbox'
  | 'progressbar'
  | 'alert'
  | 'status'
  | 'tablist'
  | 'tab';

export interface Semantics {
  role: UiRole;
  label?: string;
  checked?: boolean;
  selected?: boolean;
  expanded?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  modal?: boolean;
  describedBy?: string;
}

export type UiEvent =
  | { type: 'toggle' }
  | { type: 'open' }
  | { type: 'close' }
  | { type: 'dismiss' }
  | { type: 'move'; delta: 1 | -1 }
  | { type: 'setActive'; index: number }
  | { type: 'select'; value: string }
  | { type: 'change'; value: string }
  | { type: 'submit' };

/**
 * A complete platform-neutral definition of one component. The React renderer
 * in `@ilovecode33/ui` and the future SwiftUI renderer both implement this
 * contract; the state machine and semantics are written only once.
 */
export interface PortableComponent<S, E> {
  /** React component name, e.g. `Switch`. */
  readonly name: string;
  /** Intended native counterpart, e.g. `Toggle`. */
  readonly swiftUI: string;
  initial(): S;
  reduce(state: S, event: E): S;
  semantics(state: S): Semantics;
}
