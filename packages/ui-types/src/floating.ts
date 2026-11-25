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
