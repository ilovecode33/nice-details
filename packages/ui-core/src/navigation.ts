import type { NavigationState, NavigationEvent, Semantics, PortableComponent } from '@ilovecode33/ui-types';

export function navigationReducer<T extends string>(
  state: NavigationState<T>,
  event: NavigationEvent<T>,
): NavigationState<T> {
  if (event.value === state.active) return state;
  return { active: event.value };
}

export function navigationSemantics<T extends string>(
  state: NavigationState<T>,
  label?: string,
): Semantics {
  return { role: 'navigation', label, selected: Boolean(state.active) };
}

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
