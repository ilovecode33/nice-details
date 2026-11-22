import type { PortableComponent, Semantics } from './types';

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

export function enabledIndexes<T extends string>(state: SelectionState<T>): number[] {
  return state.options.flatMap((option, index) => (option.disabled ? [] : [index]));
}

export function createSelectionState<T extends string>(
  options: readonly SelectionOption<T>[],
  value?: T,
): SelectionState<T> {
  const selectedIndex = options.findIndex((option) => option.value === value);
  const firstEnabled = options.findIndex((option) => !option.disabled);
  return {
    options,
    value,
    open: false,
    activeIndex: selectedIndex >= 0 ? selectedIndex : Math.max(firstEnabled, 0),
  };
}

export function selectionReducer<T extends string>(
  state: SelectionState<T>,
  event: SelectionEvent<T>,
): SelectionState<T> {
  switch (event.type) {
    case 'open': {
      const selectedIndex = state.options.findIndex((option) => option.value === state.value);
      const enabled = enabledIndexes(state);
      return {
        ...state,
        open: true,
        activeIndex: selectedIndex >= 0 ? selectedIndex : (enabled[0] ?? 0),
      };
    }
    case 'close':
      return { ...state, open: false };
    case 'move': {
      const enabled = enabledIndexes(state);
      if (enabled.length === 0) return state;
      const position = enabled.indexOf(state.activeIndex);
      const next =
        position === -1
          ? 0
          : (position + event.delta + enabled.length) % enabled.length;
      return { ...state, activeIndex: enabled[next] };
    }
    case 'setActive':
      return { ...state, activeIndex: event.index };
    case 'select': {
      const option = state.options.find((item) => item.value === event.value);
      if (!option || option.disabled) return state;
      return { ...state, value: event.value, open: false };
    }
  }
}

export function comboboxSemantics<T extends string>(
  state: SelectionState<T>,
  label?: string,
): Semantics {
  return {
    role: 'combobox',
    label,
    expanded: state.open,
    disabled: state.options.every((option) => option.disabled),
  };
}

export function optionSemantics<T extends string>(
  option: SelectionOption<T>,
  state: SelectionState<T>,
  label?: string,
): Semantics {
  return {
    role: 'option',
    label,
    selected: option.value === state.value,
    disabled: option.disabled,
  };
}

/** Semantics for an iOS-style segmented control tab. */
export function tabSemantics<T extends string>(
  option: SelectionOption<T>,
  value: T,
  label?: string,
): Semantics {
  return {
    role: 'tab',
    label,
    selected: option.value === value,
    disabled: option.disabled,
  };
}

export const selectionContract: PortableComponent<
  SelectionState,
  SelectionEvent
> = {
  name: 'Select',
  swiftUI: 'Picker / Menu',
  initial: () => createSelectionState([]),
  reduce: selectionReducer,
  semantics: (state) => comboboxSemantics(state),
};
