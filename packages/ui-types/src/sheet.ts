import type { ReactNode } from 'react';

export interface SheetState {
  presented: boolean;
}

export type SheetEvent = { type: 'open' } | { type: 'dismiss' };

export interface ActionItem {
  label: string;
  onSelect: () => void;
  destructive?: boolean;
}
