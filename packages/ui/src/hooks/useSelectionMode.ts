import { useReducer } from 'react';
import { selectionModeReducer } from '@ilovecode33/ui-core';

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
