import type { MediaState, MediaEvent, Semantics, PortableComponent, SelectionModeState, SelectionModeEvent } from '@ilovecode33/ui-types';

/** Bound an index to `[0, count - 1]`; a non-positive count yields 0. */
function clamp(index: number, count: number): number {
  if (count <= 0) return 0;
  return Math.min(Math.max(index, 0), count - 1);
}

/**
 * Media pager state machine: `next`/`previous` step by one and `goTo` accepts an
 * absolute index. Every result is clamped to `[0, count - 1]` without wrapping;
 * a non-positive `count` yields index 0.
 */
export function mediaReducer(state: MediaState, event: MediaEvent): MediaState {
  switch (event.type) {
    case 'next':
      return { ...state, index: clamp(state.index + 1, state.count) };
    case 'previous':
      return { ...state, index: clamp(state.index - 1, state.count) };
    case 'goTo':
      return { ...state, index: clamp(event.index, state.count) };
  }
}

/**
 * Map pager state to `{ role: 'group', label }`. Without an explicit label the
 * position is exposed as `Item N of M`, using 1-based indexing for the item.
 */
export function mediaSemantics(state: MediaState, label?: string): Semantics {
  return { role: 'group', label: label ?? `Item ${state.index + 1} of ${state.count}` };
}

/**
 * Multi-selection state machine: `enter` preserves the current selection,
 * `exit` and `clear` empty it, and `toggle` adds or removes an id. `toggle` does
 * not check `active`; hosts decide when selection actions are available.
 */
export function selectionModeReducer(
  state: SelectionModeState,
  event: SelectionModeEvent,
): SelectionModeState {
  switch (event.type) {
    case 'enter':
      return { active: true, selectedIds: state.selectedIds };
    case 'exit':
      return { active: false, selectedIds: [] };
    case 'toggle': {
      const selectedIds = state.selectedIds.includes(event.id)
        ? state.selectedIds.filter((id) => id !== event.id)
        : [...state.selectedIds, event.id];
      return { ...state, selectedIds };
    }
    case 'clear':
      return { ...state, selectedIds: [] };
  }
}

/** Portable definition of `PhotoViewer`: initial state, reducer, and role mapping. */
export const mediaContract: PortableComponent<MediaState, MediaEvent> = {
  name: 'PhotoViewer',
  swiftUI: 'TabView with page style',
  initial: () => ({ index: 0, count: 0 }),
  reduce: mediaReducer,
  semantics: (state) => mediaSemantics(state),
};

/** Portable definition of selection mode: the `selected` role flag tracks `active`. */
export const selectionModeContract: PortableComponent<
  SelectionModeState,
  SelectionModeEvent
> = {
  name: 'SelectionMode',
  swiftUI: 'EditMode / selection',
  initial: () => ({ active: false, selectedIds: [] }),
  reduce: selectionModeReducer,
  semantics: (state) => ({ role: 'group', selected: state.active }),
};
