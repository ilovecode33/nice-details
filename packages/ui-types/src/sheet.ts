

export interface SheetState {
  presented: boolean;
}

export type SheetEvent = { type: 'open' } | { type: 'dismiss' };

/** Lifecycle phases for a modal sheet's entrance, drag, settle, and exit. */
export type SheetPhase = 'closed' | 'opening' | 'open' | 'dragging' | 'settling' | 'closing';

export interface ActionItem {
  label: string;
  onSelect: () => void;
  destructive?: boolean;
}
