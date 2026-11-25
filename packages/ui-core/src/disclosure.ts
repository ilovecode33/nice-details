import type { DisclosureState, DisclosureEvent, Semantics, PortableComponent } from '@ilovecode33/ui-types';

/**
 * Disclosure state machine: `toggle` flips `open`, `set` assigns an explicit
 * value. State contains only `open`, so no other fields are carried over.
 */
export function disclosureReducer(
  state: DisclosureState,
  event: DisclosureEvent,
): DisclosureState {
  switch (event.type) {
    case 'toggle':
      return { open: !state.open };
    case 'set':
      return { open: event.open };
  }
}

/**
 * Map disclosure state to `{ role: 'button', label, expanded: open }` so the
 * trigger announces whether its content is visible.
 */
export function disclosureSemantics(state: DisclosureState, label?: string): Semantics {
  return { role: 'button', label, expanded: state.open };
}

/** Portable definition of `Disclosure`: initial state, reducer, and role mapping. */
export const disclosureContract: PortableComponent<
  DisclosureState,
  DisclosureEvent
> = {
  name: 'Disclosure',
  swiftUI: 'DisclosureGroup',
  initial: () => ({ open: false }),
  reduce: disclosureReducer,
  semantics: (state) => disclosureSemantics(state),
};
