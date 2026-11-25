export interface DisclosureState {
  open: boolean;
}

export type DisclosureEvent = { type: 'toggle' } | { type: 'set'; open: boolean };
