import type { ReactNode } from 'react';

export interface ListState<T extends string = string> {
  items: readonly T[];
  selectedId?: T;
  expandedIds: readonly T[];
}

export type ListEvent<T extends string = string> =
  | { type: 'select'; value: T }
  | { type: 'toggleExpanded'; value: T }
  | { type: 'clear' };

export interface ListItem<T extends string = string> {
  id: T;
  title: ReactNode;
  subtitle?: ReactNode;
  leading?: ReactNode;
  trailing?: ReactNode;
  expandedContent?: ReactNode;
}
