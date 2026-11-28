import type { MouseEvent as ReactMouseEvent, ReactNode } from 'react';

export interface NavigationState<T extends string = string> {
  active: T;
}

export type NavigationEvent<T extends string = string> = { type: 'navigate'; value: T };

export interface DockItem {
  id: string;
  label: ReactNode;
  /** Renders an anchor instead of a button. */
  href?: string;
  icon?: ReactNode;
}

export interface DockNavigationHandle {
  toggle(): void;
  setCollapsed(collapsed: boolean): void;
}

export interface DockNavigationProps {
  items: readonly DockItem[];
  activeId?: string;
  /** Receives the click event; drag selection calls it without one. */
  onSelect?: (id: string, event?: ReactMouseEvent<HTMLElement>) => void;
  label?: string;
  collapsible?: boolean;
  /** Controlled collapse state. */
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  collapseLabel?: string;
  expandLabel?: string;
  deform?: boolean;
  className?: string;
}

export interface TabItem<T extends string = string> {
  value: T;
  label: ReactNode;
  icon?: ReactNode;
  badge?: ReactNode;
}
