import type { SheetState, SheetEvent, Semantics, PortableComponent } from '@ilovecode33/ui-types';
export type { SheetState, SheetEvent } from '@ilovecode33/ui-types';

export function sheetReducer(state: SheetState, event: SheetEvent): SheetState {
  switch (event.type) {
    case 'open':
      return { presented: true };
    case 'dismiss':
      return { presented: false };
  }
}

export function sheetSemantics(state: SheetState, label?: string): Semantics {
  return { role: 'dialog', label, modal: state.presented };
}

export const sheetContract: PortableComponent<SheetState, SheetEvent> = {
  name: 'Sheet',
  swiftUI: '.sheet with detents',
  initial: () => ({ presented: false }),
  reduce: sheetReducer,
  semantics: (state) => sheetSemantics(state),
};
