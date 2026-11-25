import type { FieldState, FieldEvent, Semantics, PortableComponent } from '@ilovecode33/ui-types';

/**
 * Generic form-field state machine: `change` updates `value` and clears `error`,
 * `blur` marks `touched`, `error` stores the message and marks `touched`, and
 * `reset` keeps `event.value` when present (otherwise the current value) while
 * clearing `touched` and `error`.
 */
export function fieldReducer<T>(state: FieldState<T>, event: FieldEvent<T>): FieldState<T> {
  switch (event.type) {
    case 'change':
      return { ...state, value: event.value, error: undefined };
    case 'blur':
      return { ...state, touched: true };
    case 'error':
      return { ...state, error: event.message, touched: true };
    case 'reset':
      return { value: (event.value ?? state.value), touched: false, error: undefined };
  }
}

/**
 * Map field state to `{ role: 'textbox', label, invalid, describedBy }`.
 * `describedBy` is present only when an error exists; pass the id of the element
 * that describes the error.
 */
export function fieldSemantics<T>(
  state: FieldState<T>,
  label?: string,
  describedBy?: string,
): Semantics {
  return {
    role: 'textbox',
    label,
    invalid: Boolean(state.error),
    describedBy: state.error ? describedBy : undefined,
  };
}

/** Map a checked flag to `{ role: 'checkbox', label, checked }`. */
export function checkboxSemantics(checked: boolean, label?: string): Semantics {
  return { role: 'checkbox', label, checked };
}

/**
 * Map a checked flag to `{ role: 'radio', label, checked }`; radio group
 * membership is the host's responsibility.
 */
export function radioSemantics(checked: boolean, label?: string): Semantics {
  return { role: 'radio', label, checked };
}

/** Portable definition of `FormField`: initial state, reducer, and role mapping. */
export const fieldContract: PortableComponent<FieldState, FieldEvent> = {
  name: 'FormField',
  swiftUI: 'Field with @FocusState',
  initial: () => ({ value: '', touched: false }),
  reduce: fieldReducer,
  semantics: (state) => fieldSemantics(state),
};
