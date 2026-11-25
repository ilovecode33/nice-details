import type { DisclosureState, DisclosureEvent, Semantics, PortableComponent } from '@ilovecode33/ui-types';

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

export function disclosureSemantics(state: DisclosureState, label?: string): Semantics {
  return { role: 'button', label, expanded: state.open };
}

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
