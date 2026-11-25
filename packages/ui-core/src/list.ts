import type { ListState, ListEvent, Semantics, PortableComponent } from '@ilovecode33/ui-types';
export type { ListState, ListEvent } from '@ilovecode33/ui-types';

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

export function listSemantics<T extends string>(state: ListState<T>, label?: string): Semantics {
  return { role: 'list', label };
}

export const listContract: PortableComponent<ListState, ListEvent> = {
  name: 'List',
  swiftUI: 'List',
  initial: () => ({ items: [], expandedIds: [] }),
  reduce: listReducer,
  semantics: (state) => listSemantics(state),
};
