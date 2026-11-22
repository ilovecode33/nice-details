import type { PortableComponent, Semantics } from './types';

export interface MediaState {
  index: number;
  count: number;
}

export type MediaEvent =
  | { type: 'next' }
  | { type: 'previous' }
  | { type: 'goTo'; index: number };

function clamp(index: number, count: number): number {
  if (count <= 0) return 0;
  return Math.min(Math.max(index, 0), count - 1);
}

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

export function mediaSemantics(state: MediaState, label?: string): Semantics {
  return { role: 'group', label: label ?? `Item ${state.index + 1} of ${state.count}` };
}

export interface SelectionModeState {
  active: boolean;
  selectedIds: readonly string[];
}

export type SelectionModeEvent =
  | { type: 'enter' }
  | { type: 'exit' }
  | { type: 'toggle'; id: string }
  | { type: 'clear' };

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

export const mediaContract: PortableComponent<MediaState, MediaEvent> = {
  name: 'PhotoViewer',
  swiftUI: 'TabView with page style',
  initial: () => ({ index: 0, count: 0 }),
  reduce: mediaReducer,
  semantics: (state) => mediaSemantics(state),
};

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
