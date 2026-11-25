import type { ReactNode } from 'react';

export interface SelectionOption<T extends string = string> {
  value: T;
  disabled?: boolean;
}

export interface SelectionState<T extends string = string> {
  options: readonly SelectionOption<T>[];
  value?: T;
  open: boolean;
  activeIndex: number;
}

export type SelectionEvent<T extends string = string> =
  | { type: 'open' }
  | { type: 'close' }
  | { type: 'move'; delta: 1 | -1 }
  | { type: 'setActive'; index: number }
  | { type: 'select'; value: T };

export interface SelectOption<T extends string = string> {
  value: T;
  /** May be a ReactNode, e.g. a color swatch plus text */
  label: ReactNode;
  disabled?: boolean;
  /** Visual element on the left of the option, e.g. a color example */
  leading?: ReactNode;
  /** Element on the right; defaults to ✓ when selected */
  trailing?: ReactNode;
  /** Plain text for screen readers when label is a ReactNode */
  textValue?: string;
}

export interface SelectChangeEvent<T extends string> {
  target: { value: T };
}

export interface SelectProps<T extends string = string> {
  options?: SelectOption<T>[];
  value?: T;
  defaultValue?: T;
  onChange?: (event: SelectChangeEvent<T>) => void;
  placeholder?: string;
  /** Alias for aria-label */
  label?: string;
  'aria-label'?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  name?: string;
  /** Elastic drag feedback. Defaults to true. */
  deform?: boolean;
  /** Backward compatibility: <option> children */
  children?: ReactNode;
}

export interface SegmentOption<T extends string> {
  value: T;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
}

export interface RadioOption<T extends string = string> {
  value: T;
  label: string;
}
