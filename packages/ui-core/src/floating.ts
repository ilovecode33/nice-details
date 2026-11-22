import type { PortableComponent, Semantics } from './types';

/** State of a floating chrome surface (header, dock, footer). */
export interface FloatingState {
  collapsed: boolean;
  hidden: boolean;
}

export type FloatingEvent =
  | { type: 'collapse' }
  | { type: 'expand' }
  | { type: 'toggleCollapse' }
  | { type: 'hide' }
  | { type: 'show' };

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
