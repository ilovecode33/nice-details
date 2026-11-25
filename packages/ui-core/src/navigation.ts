import type { NavigationState, NavigationEvent, Semantics, PortableComponent } from '@ilovecode33/ui-types';

/**
 * Set the active tab to `event.value`. Re-navigating to the current value
 * returns the original state object unchanged so consumers can skip re-renders.
 */
export function navigationReducer<T extends string>(
  state: NavigationState<T>,
  event: NavigationEvent<T>,
): NavigationState<T> {
  if (event.value === state.active) return state;
  return { active: event.value };
}

/**
 * Map navigation state to `{ role: 'navigation', label, selected }`, where
 * `selected` reports whether any tab is active (an empty id counts as none).
 */
export function navigationSemantics<T extends string>(
  state: NavigationState<T>,
  label?: string,
): Semantics {
  return { role: 'navigation', label, selected: Boolean(state.active) };
}

/** Portable definition of `TabBar`: initial state, reducer, and role mapping. */
export const navigationContract: PortableComponent<
  NavigationState,
  NavigationEvent
> = {
  name: 'TabBar',
  swiftUI: 'TabView',
  initial: () => ({ active: '' }),
  reduce: navigationReducer,
  semantics: (state) => navigationSemantics(state),
};
