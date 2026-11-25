export interface ToggleState {
  checked: boolean;
  disabled?: boolean;
}

export type ToggleEvent =
  | { type: 'toggle' }
  | { type: 'set'; checked: boolean };
