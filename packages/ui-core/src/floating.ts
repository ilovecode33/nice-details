import type { FloatingState, FloatingEvent, Semantics, PortableComponent } from '@ilovecode33/ui-types';

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

export function floatingSemantics(state: FloatingState, label?: string): Semantics {
  return {
    role: 'toolbar',
    label,
    expanded: !state.collapsed && !state.hidden,
  };
}

export const floatingContract: PortableComponent<FloatingState, FloatingEvent> = {
  name: 'FloatingBar',
  swiftUI: '.safeAreaInset with .ultraThinMaterial',
  initial: () => ({ collapsed: false, hidden: false }),
  reduce: floatingReducer,
  semantics: (state) => floatingSemantics(state),
};
