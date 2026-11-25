import type { SelectOption, SelectChangeEvent, SelectProps } from '@ilovecode33/ui-types';
import styles from './Select.module.css';
import { comboboxSemantics, enabledIndexes, optionSemantics, selectionReducer } from '@ilovecode33/ui-core';
import type { SelectionEvent, SelectionState } from '@ilovecode33/ui-types';
import {
  Children,
  isValidElement,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react';
import { Deformable } from './Deformable';



/** Accessible custom dropdown with rich option content. */

function optionsFromChildren(children: ReactNode): SelectOption[] {
  return Children.toArray(children).flatMap((child) => {
    if (!isValidElement(child)) return [];
    const props = child.props as {
      value?: string | number;
      children?: ReactNode;
      disabled?: boolean;
    };
    if (props.value === undefined) return [];
    return [
      {
        value: String(props.value),
        label: props.children,
        disabled: props.disabled,
      },
    ];
  });
}

/**
 * Custom dropdown: supports rich options (color swatches, icons) with full
 * touch, keyboard, and ARIA behavior.
 */
export function Select<T extends string = string>({
  options,
  value,
  defaultValue,
  onChange,
  placeholder = 'Select...',
  label,
  'aria-label': ariaLabel,
  disabled = false,
  className = '',
  id,
  name,
  deform = true,
  children,
}: SelectProps<T>) {
  const list = options ?? (optionsFromChildren(children) as SelectOption<T>[]);
  const [internalValue, setInternalValue] = useState<T | undefined>(defaultValue);
  const currentValue = value !== undefined ? value : internalValue;
  const selected = list.find((o) => o.value === currentValue);

  // Open/active interaction is owned by the platform-neutral selection contract.
  const [interaction, setInteraction] = useState<Pick<SelectionState<T>, 'open' | 'activeIndex'>>(
    () => ({ open: false, activeIndex: 0 }),
  );
  const state: SelectionState<T> = {
    options: list.map((o) => ({ value: o.value, disabled: o.disabled })),
    value: currentValue,
    open: interaction.open,
    activeIndex: interaction.activeIndex,
  };
  const enabled = enabledIndexes(state);
  const accessibleLabel = ariaLabel ?? label;
  const semantics = comboboxSemantics(state, accessibleLabel);

  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const dispatch = (event: SelectionEvent<T>) => {
    const next = selectionReducer(state, event);
    setInteraction({ open: next.open, activeIndex: next.activeIndex });
  };

  const openList = () => {
    if (disabled) return;
    dispatch({ type: 'open' });
  };

  const closeList = (focusTrigger = true) => {
    dispatch({ type: 'close' });
    if (focusTrigger) triggerRef.current?.focus();
  };

  const choose = (option: SelectOption<T>) => {
    if (option.disabled) return;
    dispatch({ type: 'select', value: option.value });
    if (value === undefined) setInternalValue(option.value);
    onChange?.({ target: { value: option.value } });
    closeList();
  };

  useEffect(() => {
    if (!state.open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) dispatch({ type: 'close' });
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [state.open]);

  useEffect(() => {
    if (!state.open) return;
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${state.activeIndex}"]`)
      ?.scrollIntoView({ block: 'nearest' });
  }, [state.activeIndex, state.open]);

  const onTriggerKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!state.open) {
        openList();
        if (event.key === 'ArrowUp') {
          setInteraction((prev) => ({ ...prev, activeIndex: enabled.at(-1) ?? 0 }));
        }
      } else {
        dispatch({ type: 'move', delta: event.key === 'ArrowDown' ? 1 : -1 });
      }
      return;
    }

    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      if (!state.open) openList();
      setInteraction((prev) => ({
        ...prev,
        activeIndex:
          event.key === 'Home' ? (enabled[0] ?? 0) : (enabled.at(-1) ?? 0),
      }));
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (!state.open) openList();
      else {
        const option = list[state.activeIndex];
        if (option) choose(option);
      }
      return;
    }

    if (event.key === 'Escape' && state.open) {
      event.preventDefault();
      closeList();
      return;
    }

    if (event.key === 'Tab' && state.open) dispatch({ type: 'close' });
  };

  return (
    <Deformable
      enabled={deform}
      touchAction="pan-y"
      style={{ zIndex: state.open ? 50 : undefined }}
    >
    <div
      ref={wrapRef}
      className={[styles['ui-select__wrap'], className].filter(Boolean).join(' ')}
      style={{ zIndex: state.open ? 50 : undefined }}
    >
      <button
        id={id}
        ref={triggerRef}
        type="button"
        className={[styles['ui-select'], styles['ui-select--trigger'], styles[state.open ? 'is-open' : ''] || ''].filter(Boolean).join(' ')}
        role={semantics.role}
        aria-haspopup="listbox"
        aria-expanded={semantics.expanded}
        aria-controls={state.open ? listId : undefined}
        aria-activedescendant={state.open ? `${listId}-${state.activeIndex}` : undefined}
        aria-label={semantics.label}
        aria-disabled={disabled || semantics.disabled || undefined}
        disabled={disabled}
        onClick={() => (state.open ? closeList(false) : openList())}
        onKeyDown={onTriggerKeyDown}
      >
        <span className={styles['ui-select__value']}>
          {selected ? (
            <>
              {selected.leading}
              <span>{selected.label}</span>
            </>
          ) : (
            <span className={styles['ui-select__placeholder']}>{placeholder}</span>
          )}
        </span>
        <span className={styles['ui-select__chevron']} aria-hidden="true">
          ⌄
        </span>
      </button>

      {state.open && (
        <div
          ref={listRef}
          id={listId}
          role="listbox"
          aria-label={accessibleLabel}
          className={styles['ui-select__menu']}
        >
          {list.length === 0 && <div className={styles['ui-select__empty']}>No options</div>}
          {list.map((option, index) => {
            const optionState = optionSemantics(option, state, option.textValue);
            return (
              <button
                type="button"
                key={option.value}
                id={`${listId}-${index}`}
                data-index={index}
                role={optionState.role}
                tabIndex={-1}
                aria-selected={optionState.selected}
                aria-disabled={optionState.disabled || undefined}
                aria-label={optionState.label}
                className={[styles['ui-select__option'], styles[index === state.activeIndex ? 'is-active' : ''] || ''].filter(Boolean).join(' ')}
                onPointerEnter={() => !option.disabled && dispatch({ type: 'setActive', index })}
                onClick={() => choose(option)}
              >
                {option.leading && (
                  <span className={styles['ui-select__leading']} aria-hidden="true">
                    {option.leading}
                  </span>
                )}
                <span className={styles['ui-select__option-label']}>{option.label}</span>
                {option.trailing ??
                  (optionState.selected ? (
                    <span className={styles['ui-select__check']} aria-hidden="true">
                      ✓
                    </span>
                  ) : null)}
              </button>
            );
          })}
        </div>
      )}

      {name && <input type="hidden" name={name} value={currentValue ?? ''} />}
    </div>
    </Deformable>
  );
}
