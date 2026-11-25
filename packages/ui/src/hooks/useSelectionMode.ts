import { useReducer } from 'react';
import { selectionModeReducer } from '@ilovecode33/ui-core';

/**
 * Manage multi-selection mode with `selectionModeReducer`. `initial` seeds the
 * selected ids while the mode starts inactive. Returns the `active` flag,
 * `selectedIds`, and dispatchers for `toggle`, `enter`, `exit`, and `clear`;
 * exiting or clearing empties the selection, while entering preserves it.
 */
export function useSelectionMode(initial: readonly string[] = []) {
  const [state, dispatch] = useReducer(selectionModeReducer, {
    active: false,
    selectedIds: initial,
  });
  return {
    active: state.active,
    selectedIds: state.selectedIds,
    toggle: (id: string) => dispatch({ type: 'toggle', id }),
    enter: () => dispatch({ type: 'enter' }),
    exit: () => dispatch({ type: 'exit' }),
    clear: () => dispatch({ type: 'clear' }),
  };
}
