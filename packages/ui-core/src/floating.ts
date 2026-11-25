import type { FloatingState, FloatingEvent, Semantics, PortableComponent } from '@ilovecode33/ui-types';

/**
 * Floating-bar state machine over two independent flags: collapse/expand (with
 * `toggleCollapse`) changes `collapsed`, hide/show changes `hidden`. Hiding does
 * not implicitly change the collapsed state, or vice versa.
 */
export function floatingReducer(
  state: FloatingState,
  event: FloatingEvent,
): FloatingState {
  switch (event.type) {
    case 'collapse':
      return { ...state, collapsed: true };
    case 'expand':
      return { ...state, collapsed: false };
    case 'toggleCollapse':
      return { ...state, collapsed: !state.collapsed };
    case 'hide':
      return { ...state, hidden: true };
    case 'show':
      return { ...state, hidden: false };
  }
}

/**
 * Map floating-bar state to `{ role: 'toolbar', label, expanded }`, where
 * `expanded` is true only when the bar is neither collapsed nor hidden.
 */
export function floatingSemantics(state: FloatingState, label?: string): Semantics {
  return {
    role: 'toolbar',
    label,
    expanded: !state.collapsed && !state.hidden,
  };
}

/** Portable definition of `FloatingBar`: initial state, reducer, and role mapping. */
export const floatingContract: PortableComponent<FloatingState, FloatingEvent> = {
  name: 'FloatingBar',
  swiftUI: '.safeAreaInset with .ultraThinMaterial',
  initial: () => ({ collapsed: false, hidden: false }),
  reduce: floatingReducer,
  semantics: (state) => floatingSemantics(state),
};
