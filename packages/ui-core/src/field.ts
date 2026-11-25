import type { FieldState, FieldEvent, Semantics, PortableComponent } from '@ilovecode33/ui-types';
export type { FieldState, FieldEvent } from '@ilovecode33/ui-types';

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

export function checkboxSemantics(checked: boolean, label?: string): Semantics {
  return { role: 'checkbox', label, checked };
}

export function radioSemantics(checked: boolean, label?: string): Semantics {
  return { role: 'radio', label, checked };
}

export const fieldContract: PortableComponent<FieldState, FieldEvent> = {
  name: 'FormField',
  swiftUI: 'Field with @FocusState',
  initial: () => ({ value: '', touched: false }),
  reduce: fieldReducer,
  semantics: (state) => fieldSemantics(state),
};
