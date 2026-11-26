import type { SelectOption, SelectProps } from '@ilovecode33/ui-types';
import styles from './Select.module.css';
import { comboboxSemantics, enabledIndexes, optionSemantics, selectionReducer } from '@ilovecode33/ui-core';
import type { SelectionEvent, SelectionState } from '@ilovecode33/ui-types';
import { Children, isValidElement, useEffect, useId, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import { Deformable } from './Deformable';

/**
 * Derives the option list from element children: skips non-elements and
 * children without a `value`, stringifies values, and preserves disabled state.
 * Used only when the `options` prop is absent.
 */

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
 * Vertical travel (px) that turns a trigger press into a direction drag. Below
 * it the gesture stays an ordinary click; once crossed, the synthetic click
 * after pointerup is suppressed so the menu just opened (or flipped) is not
 * immediately toggled shut.
 */
const DRAG_THRESHOLD = 8;

type DragGesture = {
  pointerId: number;
  startY: number;
  direction: 'up' | 'down' | null;
  listOpen: boolean;
};

/**
 * Custom listbox-style dropdown supporting rich option content (leading nodes,
 * icons) with full keyboard and ARIA combobox behavior.
 * Controlled via `value` or uncontrolled via `defaultValue`; closes on outside
 * pointerdown or Escape (focus returns to the trigger on select and Escape).
 * A vertical trigger drag opens the menu toward the drag; a plain click toggles.
 * `placeholder` defaults to 'Select...'; labels come from props or children.
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
  const [dropUp, setDropUp] = useState(false);
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

  /** Closes the list and, by default, returns focus to the trigger. */
  const closeList = (focusTrigger = true) => {
    dispatch({ type: 'close' });
    if (focusTrigger) triggerRef.current?.focus();
  };

  /** Selects an enabled option, updating internal state only when uncontrolled. */
  const choose = (option: SelectOption<T>) => {
    if (option.disabled) return;
    dispatch({ type: 'select', value: option.value });
    if (value === undefined) setInternalValue(option.value);
    onChange?.({ target: { value: option.value } });
    closeList();
  };

  const dragRef = useRef<DragGesture | null>(null);
  const suppressClickRef = useRef(false);
  const detachDragRef = useRef<(() => void) | null>(null);

  /** Removes the document-level drag listeners; idempotent, including on unmount. */
  const detachDragListeners = () => {
    detachDragRef.current?.();
    detachDragRef.current = null;
  };

  useEffect(() => {
    return () => {
      detachDragRef.current?.();
      detachDragRef.current = null;
    };
  }, []);

  /**
   * Starts a vertical drag on the trigger. Listeners live on `document` in the
   * capture phase because Deformable may call setPointerCapture on its wrapper,
   * making trigger-level move/up events unreliable. Crossing DRAG_THRESHOLD
   * opens the menu or flips its direction and arms `suppressClickRef`, which the
   * trigger's onClick consumes once; sub-threshold presses stay ordinary clicks.
   */
  const onTriggerPointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    // A drag whose click landed elsewhere must not suppress the next real click.
    suppressClickRef.current = false;
    if (disabled || (event.pointerType === 'mouse' && event.button !== 0)) return;

    detachDragListeners();
    dragRef.current = {
      pointerId: event.pointerId,
      startY: event.clientY,
      direction: null,
      listOpen: state.open,
    };

    const onMove = (moveEvent: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag || moveEvent.pointerId !== drag.pointerId) return;
      const deltaY = moveEvent.clientY - drag.startY;
      const next: DragGesture['direction'] =
        deltaY <= -DRAG_THRESHOLD ? 'up' : deltaY >= DRAG_THRESHOLD ? 'down' : null;
      if (!next) return;
      // Any threshold crossing is a drag, even if the direction stays the same.
      suppressClickRef.current = true;
      if (next === drag.direction) return;
      drag.direction = next;
      setDropUp(next === 'up');
      if (!drag.listOpen) {
        drag.listOpen = true;
        openList();
      }
    };

    /** Ends this gesture; a leftover click flag is cleared by the next pointerdown. */
    const onEnd = (endEvent: PointerEvent) => {
      if (endEvent.pointerId !== dragRef.current?.pointerId) return;
      dragRef.current = null;
      detachDragListeners();
    };

    document.addEventListener('pointermove', onMove, true);
    document.addEventListener('pointerup', onEnd, true);
    document.addEventListener('pointercancel', onEnd, true);
    detachDragRef.current = () => {
      document.removeEventListener('pointermove', onMove, true);
      document.removeEventListener('pointerup', onEnd, true);
      document.removeEventListener('pointercancel', onEnd, true);
    };
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
        setDropUp(event.key === 'ArrowUp');
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
      data-ui="select__wrap"
      style={{ zIndex: state.open ? 50 : undefined }}
    >
      <button
        id={id}
        ref={triggerRef}
        type="button"
        className={[styles['ui-select'], styles['ui-select--trigger'], styles[state.open ? 'is-open' : ''] || ''].filter(Boolean).join(' ')}
        data-ui="select"
        role={semantics.role}
        aria-haspopup="listbox"
        aria-expanded={semantics.expanded}
        aria-controls={state.open ? listId : undefined}
        aria-activedescendant={state.open ? `${listId}-${state.activeIndex}` : undefined}
        aria-label={semantics.label}
        aria-disabled={disabled || semantics.disabled || undefined}
        disabled={disabled}
        onClick={() => {
          if (suppressClickRef.current) {
            suppressClickRef.current = false;
            return;
          }
          if (state.open) closeList(false);
          else {
            setDropUp(false);
            openList();
          }
        }}
        onPointerDown={onTriggerPointerDown}
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
          className={[styles['ui-select__menu'], dropUp ? styles['ui-select__menu--up'] : ''].filter(Boolean).join(' ')}
          data-ui={dropUp ? 'select__menu select__menu--up' : 'select__menu'}
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
