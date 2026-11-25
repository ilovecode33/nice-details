import type { SheetState, SheetEvent, Semantics, PortableComponent } from '@ilovecode33/ui-types';

/** Set `presented` from `open` or `dismiss`; the state holds only that flag. */
export function sheetReducer(state: SheetState, event: SheetEvent): SheetState {
  switch (event.type) {
    case 'open':
      return { presented: true };
    case 'dismiss':
      return { presented: false };
  }
}

/**
 * Map sheet state to `{ role: 'dialog', label, modal: presented }` so the modal
 * attribute mirrors whether the sheet is presented.
 */
export function sheetSemantics(state: SheetState, label?: string): Semantics {
  return { role: 'dialog', label, modal: state.presented };
}

/** Portable definition of `Sheet`: initial state, reducer, and role mapping. */
export const sheetContract: PortableComponent<SheetState, SheetEvent> = {
  name: 'Sheet',
  swiftUI: '.sheet with detents',
  initial: () => ({ presented: false }),
  reduce: sheetReducer,
  semantics: (state) => sheetSemantics(state),
};
