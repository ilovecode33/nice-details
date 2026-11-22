import type { PortableComponent, Semantics } from './types';

export interface ToggleState {
  checked: boolean;
  disabled?: boolean;
}

export type ToggleEvent =
  | { type: 'toggle' }
  | { type: 'set'; checked: boolean };

export function toggleReducer(state: ToggleState, event: ToggleEvent): ToggleState {
  if (state.disabled) return state;
  switch (event.type) {
    case 'toggle':
      return { ...state, checked: !state.checked };
    case 'set':
      return { ...state, checked: event.checked };
  }
}

export function toggleSemantics(state: ToggleState, label?: string): Semantics {
  return {
    role: 'switch',
    label,
    checked: state.checked,
    disabled: state.disabled,
  };
}

export const toggleContract: PortableComponent<ToggleState, ToggleEvent> = {
  name: 'Switch',
  swiftUI: 'Toggle',
  initial: () => ({ checked: false }),
  reduce: toggleReducer,
  semantics: (state) => toggleSemantics(state),
};
