import type { ToggleState, ToggleEvent, Semantics, PortableComponent } from '@ilovecode33/ui-types';
export type { ToggleState, ToggleEvent } from '@ilovecode33/ui-types';

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
