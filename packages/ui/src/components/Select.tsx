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
 * Travel (px) that turns a trigger press into a direction drag. The gesture
 * opens/flips the menu only when vertical dominance is detected first — that
 * is, |deltaY| >= 8 and |deltaY| > |deltaX| * 1.2 — while a horizontal-dominant
 * press (|deltaX| > |deltaY| * 1.2 and |deltaX| >= 8) is ignored: it never
 * opens, never flips, and never arms click suppression. The chosen intent is
 * sticky for the whole gesture, so a later move in the other direction cannot
 * change it. Below the threshold the press stays an ordinary click; once
 * crossed with a vertical intent, the synthetic click after pointerup is
 * suppressed so the menu just opened (or flipped) is not immediately toggled
 * shut.
 */
const DRAG_THRESHOLD = 8;

type DragGesture = {
  pointerId: number;
  startX: number;
  startY: number;
  direction: 'up' | 'down' | null;
  listOpen: boolean;
  /** Sticky: once horizontal intent wins, the rest of the gesture is ignored. */
  horizontal: boolean;
};

/**
 * Custom listbox-style dropdown supporting rich option content (leading nodes,
 * icons) with full keyboard and ARIA combobox behavior.
 * Controlled via `value` or uncontrolled via `defaultValue`; closes on outside
 * pointerdown or Escape (focus returns to the trigger on select and Escape).
 * A vertical-dominant trigger drag opens the menu toward the drag; a
 * horizontal-dominant drag is ignored; a plain click toggles.
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

  /**
   * Resolves the option index under a client point. Menu drags use this instead
   * of pointerenter because Deformable may capture the pointer, which retargets
   * move events away from the options.
   */
  const optionIndexAt = (x: number, y: number): number | null => {
    const menu = listRef.current;
    if (!menu || typeof document.elementFromPoint !== 'function') return null;
    const hit = document.elementFromPoint(x, y)?.closest<HTMLElement>('[data-index]');
    if (!hit || !menu.contains(hit)) return null;
    const index = Number(hit.dataset.index);
    return Number.isInteger(index) ? index : null;
  };

  const dispatch = (event: SelectionEvent<T>) => {
    // Functional update so document-level drag handlers created earlier in the
    // gesture cannot reset `open` from a stale render.
    setInteraction((prev) => {
      const next = selectionReducer(
        { ...state, open: prev.open, activeIndex: prev.activeIndex },
        event,
      );
      return { open: next.open, activeIndex: next.activeIndex };
    });
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
  // Press-and-slide inside an open menu: the option under the pointer becomes
  // active as the finger moves, and releasing applies it and closes the list.
  const menuDragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    moved: boolean;
  } | null>(null);
  const detachMenuDragRef = useRef<(() => void) | null>(null);

  /** Removes the document-level drag listeners; idempotent, including on unmount. */
  const detachDragListeners = () => {
    detachDragRef.current?.();
    detachDragRef.current = null;
  };

  const detachMenuDragListeners = () => {
    detachMenuDragRef.current?.();
    detachMenuDragRef.current = null;
  };

  useEffect(() => {
    return () => {
      detachDragRef.current?.();
      detachDragRef.current = null;
      detachMenuDragRef.current?.();
      detachMenuDragRef.current = null;
    };
  }, []);

  /**
   * Starts a drag on the trigger. Listeners live on `document` in the capture
   * phase because Deformable may call setPointerCapture on its wrapper, making
   * trigger-level move/up events unreliable. The first move that shows clear
   * dominance decides the gesture's intent: vertical opens/flips the menu and
   * arms `suppressClickRef`, which the trigger's onClick consumes once, while
   * horizontal ignores the rest of the gesture without arming suppression. The
   * intent is sticky and sub-threshold presses stay ordinary clicks.
   */
  const onTriggerPointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    // A drag whose click landed elsewhere must not suppress the next real click.
    suppressClickRef.current = false;
    if (disabled || (event.pointerType === 'mouse' && event.button !== 0)) return;

    detachDragListeners();
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      direction: null,
      listOpen: state.open,
      horizontal: false,
    };

    const onMove = (moveEvent: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag || moveEvent.pointerId !== drag.pointerId) return;
      // A horizontal intent is sticky: ignore every later move of this gesture.
      if (drag.horizontal) return;

      const deltaX = moveEvent.clientX - drag.startX;
      const deltaY = moveEvent.clientY - drag.startY;

      if (!drag.direction) {
        // Decide intent once: the first move with clear dominance wins.
        if (
          Math.abs(deltaX) > Math.abs(deltaY) * 1.2 &&
          Math.abs(deltaX) >= DRAG_THRESHOLD
        ) {
          drag.horizontal = true;
          return;
        }
        if (
          Math.abs(deltaY) < DRAG_THRESHOLD ||
          Math.abs(deltaY) <= Math.abs(deltaX) * 1.2
        ) {
          return;
        }
      }

      // Vertical intent (or an already-decided vertical drag): open/flip.
      const next: DragGesture['direction'] =
        deltaY <= -DRAG_THRESHOLD ? 'up' : deltaY >= DRAG_THRESHOLD ? 'down' : null;
      if (!next) return;
      // Any threshold crossing is a drag, even if the direction stays the same.
      suppressClickRef.current = true;
      if (next !== drag.direction) drag.direction = next;
      // Only the gesture that opens the menu picks its side. Once open — by this
      // gesture or an earlier click/keyboard/drag — the drop side is locked, so a
      // later opposite drag cannot flip an already-open list.
      if (!drag.listOpen) {
        drag.listOpen = true;
        setDropUp(next === 'up');
        openList();
      }
      // While the menu is open, track the option under the pointer so the same
      // press can slide onto a choice and commit it on release.
      const index = optionIndexAt(moveEvent.clientX, moveEvent.clientY);
      if (index !== null) {
        const option = list[index];
        if (option && !option.disabled) dispatch({ type: 'setActive', index });
      }
    };

    /** Ends this gesture; a leftover click flag is cleared by the next pointerdown. */
    const onEnd = (endEvent: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag || endEvent.pointerId !== drag.pointerId) return;
      dragRef.current = null;
      detachDragListeners();
      // A vertical drag released over an option commits it and closes the menu.
      if (endEvent.type !== 'pointerup' || !drag.direction) return;
      const index = optionIndexAt(endEvent.clientX, endEvent.clientY);
      const option = index !== null ? list[index] : undefined;
      if (option && !option.disabled) choose(option);
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

  /**
   * Press-and-slide inside an already-open menu. Moving past the threshold
   * highlights the option under the pointer; releasing applies it and closes.
   * A sub-threshold press stays a plain click so taps keep working.
   */
  const onMenuPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    const hit = (event.target as HTMLElement).closest<HTMLElement>('[data-index]');
    if (!hit || !listRef.current?.contains(hit)) return;
    const startIndex = Number(hit.dataset.index);
    if (!Number.isInteger(startIndex) || list[startIndex]?.disabled) return;

    detachMenuDragListeners();
    menuDragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      moved: false,
    };

    const onMove = (moveEvent: PointerEvent) => {
      const drag = menuDragRef.current;
      if (!drag || moveEvent.pointerId !== drag.pointerId) return;
      if (
        !drag.moved &&
        (Math.abs(moveEvent.clientX - drag.startX) > DRAG_THRESHOLD ||
          Math.abs(moveEvent.clientY - drag.startY) > DRAG_THRESHOLD)
      ) {
        drag.moved = true;
      }
      if (!drag.moved) return;
      const index = optionIndexAt(moveEvent.clientX, moveEvent.clientY);
      if (index === null) return;
      const option = list[index];
      if (option && !option.disabled) dispatch({ type: 'setActive', index });
    };

    const onUp = (upEvent: PointerEvent) => {
      const drag = menuDragRef.current;
      if (!drag || upEvent.pointerId !== drag.pointerId) return;
      menuDragRef.current = null;
      detachMenuDragListeners();
      if (upEvent.type !== 'pointerup' || !drag.moved) return;
      const index = optionIndexAt(upEvent.clientX, upEvent.clientY);
      const option = index !== null ? list[index] : undefined;
      if (option && !option.disabled) choose(option);
    };

    document.addEventListener('pointermove', onMove, true);
    document.addEventListener('pointerup', onUp, true);
    document.addEventListener('pointercancel', onUp, true);
    detachMenuDragRef.current = () => {
      document.removeEventListener('pointermove', onMove, true);
      document.removeEventListener('pointerup', onUp, true);
      document.removeEventListener('pointercancel', onUp, true);
    };
  };

  // Drop any in-flight menu drag when the list closes or the component unmounts.
  useEffect(() => {
    if (state.open) return;
    detachMenuDragRef.current?.();
    detachMenuDragRef.current = null;
    menuDragRef.current = null;
  }, [state.open]);

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
          onPointerDown={onMenuPointerDown}
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
