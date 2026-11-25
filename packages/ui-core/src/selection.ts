import type { SelectionOption, SelectionState, SelectionEvent, Semantics, PortableComponent } from '@ilovecode33/ui-types';

/**
 * Return the indexes of non-disabled options in option order. Keyboard movement
 * uses this list to skip disabled entries; an empty array means no option can
 * receive focus.
 */
export function enabledIndexes<T extends string>(state: SelectionState<T>): number[] {
  return state.options.flatMap((option, index) => (option.disabled ? [] : [index]));
}

/**
 * Build initial select state: closed, with `activeIndex` at `value` when it is
 * found among the options, otherwise at the first enabled option, or 0 when all
 * are disabled. The options array is retained by reference.
 */
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

/**
 * Select-menu state machine. `open` targets the selected option or the first
 * enabled one; `move` wraps through enabled indexes only and is a no-op when
 * none are enabled; `setActive` assigns an index directly; `select` commits a
 * value and closes but ignores unknown or disabled options. `close` only clears
 * `open`, leaving the active index intact.
 */
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

/**
 * Map select state to `{ role: 'combobox', label, expanded, disabled }`;
 * `disabled` is true only when every option is disabled.
 */
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

/**
 * Map an option to `{ role: 'option', label, selected, disabled }`, with
 * selection determined by comparison to the current `state.value`.
 */
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

/**
 * Map an option to `{ role: 'tab', label, selected, disabled }` for a segmented
 * control; selection is compared against the supplied `value`.
 */
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

/** Portable definition of `Select`: initial state, reducer, and role mapping. */
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
