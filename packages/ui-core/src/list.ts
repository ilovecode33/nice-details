import type { ListState, ListEvent, Semantics, PortableComponent } from '@ilovecode33/ui-types';

/**
 * List state machine: `select` sets `selectedId`, `clear` unsets it, and
 * `toggleExpanded` adds or removes an id from `expandedIds`. Unchanged fields
 * are preserved; selection is single-choice and `select` does not toggle off.
 */
export function listReducer<T extends string>(
  state: ListState<T>,
  event: ListEvent<T>,
): ListState<T> {
  switch (event.type) {
    case 'select':
      return { ...state, selectedId: event.value };
    case 'toggleExpanded': {
      const expanded = state.expandedIds.includes(event.value)
        ? state.expandedIds.filter((id) => id !== event.value)
        : [...state.expandedIds, event.value];
      return { ...state, expandedIds: expanded };
    }
    case 'clear':
      return { ...state, selectedId: undefined };
  }
}

/**
 * Map a list to `{ role: 'list', label }`. Selection and expansion are exposed
 * by the child rows rather than by the container.
 */
export function listSemantics<T extends string>(state: ListState<T>, label?: string): Semantics {
  return { role: 'list', label };
}

/** Portable definition of `List`: initial state, reducer, and role mapping. */
export const listContract: PortableComponent<ListState, ListEvent> = {
  name: 'List',
  swiftUI: 'List',
  initial: () => ({ items: [], expandedIds: [] }),
  reduce: listReducer,
  semantics: (state) => listSemantics(state),
};
