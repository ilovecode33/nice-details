/**
 * Framework-neutral component vocabulary shared by `@ilovecode33/ui-core`,
 * the React renderer and future platform renderers.
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

export type DeformAxis = 'x' | 'y' | 'both';

export interface DeformState {
  active: boolean;
  /** Resisted offset in px. */
  dx: number;
  dy: number;
  /** Unresisted pointer delta, kept for hosts that need it. */
  rawX: number;
  rawY: number;
  /** 0 → 1 along each axis. */
  intensityX: number;
  intensityY: number;
  /** 0 → 1 overall. */
  progress: number;
}

export type DeformEvent =
  | { type: 'start' }
  | {
      type: 'move';
      dx: number;
      dy: number;
      max?: number;
      axis?: DeformAxis;
    }
  | { type: 'end' };

export type UiEvent =
  | { type: 'toggle' }
  | { type: 'open' }
  | { type: 'close' }
  | { type: 'dismiss' }
  | { type: 'move'; delta: 1 | -1 }

export interface ToggleState {
  checked: boolean;
  disabled?: boolean;
}

export type ToggleEvent =
  | { type: 'toggle' }
  | { type: 'set'; checked: boolean };

export interface SelectionOption<T extends string = string> {
  value: T;
  disabled?: boolean;
}

export interface SelectionState<T extends string = string> {
  options: readonly SelectionOption<T>[];
  value?: T;
  open: boolean;
  activeIndex: number;
}

export type SelectionEvent<T extends string = string> =
  | { type: 'open' }
  | { type: 'close' }
  | { type: 'move'; delta: 1 | -1 }
  | { type: 'setActive'; index: number }
  | { type: 'select'; value: T };

export interface DisclosureState {
  open: boolean;
}

export type DisclosureEvent = { type: 'toggle' } | { type: 'set'; open: boolean };

export interface SheetState {
  presented: boolean;
}

export type SheetEvent = { type: 'open' } | { type: 'dismiss' };

export interface FieldState<T = string> {
  value: T;
  touched: boolean;
  error?: string;
}

export type FieldEvent<T = string> =
  | { type: 'change'; value: T }
  | { type: 'blur' }
  | { type: 'error'; message?: string }
  | { type: 'reset'; value?: T };

export interface ListState<T extends string = string> {
  items: readonly T[];
  selectedId?: T;
  expandedIds: readonly T[];
}

export type ListEvent<T extends string = string> =
  | { type: 'select'; value: T }
  | { type: 'toggleExpanded'; value: T }
  | { type: 'clear' };

export type FeedbackTone = 'info' | 'success' | 'danger';

export interface FeedbackState {
  tone: FeedbackTone;
  message: string;
  visible: boolean;
  actionLabel?: string;
}

export type FeedbackEvent =
  | { type: 'show'; tone: FeedbackTone; message: string; actionLabel?: string }
  | { type: 'dismiss' };

export interface MediaState {
  index: number;
  count: number;
}

export type MediaEvent =
  | { type: 'next' }
  | { type: 'previous' }
  | { type: 'goTo'; index: number };

function clamp(index: number, count: number): number {
  if (count <= 0) return 0;
  return Math.min(Math.max(index, 0), count - 1);
}

export interface NavigationState<T extends string = string> {
  active: T;
}

export type NavigationEvent<T extends string = string> = { type: 'navigate'; value: T };

export interface FloatingState {
  collapsed: boolean;
  hidden: boolean;
}

export type FloatingEvent =
  | { type: 'collapse' }
  | { type: 'expand' }
  | { type: 'toggleCollapse' }
  | { type: 'hide' }
  | { type: 'show' };

export interface SelectionModeState {
  active: boolean;
  selectedIds: readonly string[];
}

export type SelectionModeEvent =
  | { type: 'enter' }
  | { type: 'exit' }
  | { type: 'toggle'; id: string }
  | { type: 'clear' };
