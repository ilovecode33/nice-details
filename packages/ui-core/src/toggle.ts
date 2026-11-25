import type { ToggleState, ToggleEvent, Semantics, PortableComponent } from '@ilovecode33/ui-types';

/**
 * Toggle or explicitly set `checked`. When `disabled` is true every event
 * returns the state unchanged, so callers cannot mutate the value programmatically.
 */
export function toggleReducer(state: ToggleState, event: ToggleEvent): ToggleState {
  if (state.disabled) return state;
  switch (event.type) {
    case 'toggle':
      return { ...state, checked: !state.checked };
    case 'set':
      return { ...state, checked: event.checked };
  }
}

/**
 * Map toggle state to `{ role: 'switch', label, checked, disabled }` so ARIA
 * mirrors the switch's visual state.
 */
export function toggleSemantics(state: ToggleState, label?: string): Semantics {
  return {
    role: 'switch',
    label,
    checked: state.checked,
    disabled: state.disabled,
  };
}

/** Portable definition of `Switch`: initial state, reducer, and role mapping. */
export const toggleContract: PortableComponent<ToggleState, ToggleEvent> = {
  name: 'Switch',
  swiftUI: 'Toggle',
  initial: () => ({ checked: false }),
  reduce: toggleReducer,
  semantics: (state) => toggleSemantics(state),
};
