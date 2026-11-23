/**
 * Mobile-first UI components.
 *
 * Design basis: Apple HIG principles — clear purpose, 44pt touch targets,
 * readable text, accessible focus, reduced-motion support, and subtle motion.
 * Styles live in styles.css; base rules target a phone, with refinements at
 * `@media (min-width: 768px)`.
 */

import {
  Deformable,
  PressGlow,
  useDeform,
  usePrefersReducedMotion,
} from './motion';
import {
  comboboxSemantics,
  createSelectionState,
  enabledIndexes,
  optionSemantics,
  selectionReducer,
  sheetSemantics,
  tabSemantics,
  toggleReducer,
  toggleSemantics,
  type SelectionEvent,
  type SelectionState,
} from '@ilovecode33/ui-core';
import {
  Children,
  isValidElement,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react';
import { cn } from './css';

/* ── Button ──────────────────────────────────────────────────────────────── */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'destructive' | 'plain';
  size?: 'default' | 'compact';
  icon?: ReactNode;
  block?: boolean;
  /** Directional press/drag deformation. Disabled automatically under reduced motion. */
  deform?: boolean;
}

export function Button({
  variant = 'secondary',
  size = 'default',
  icon,
  block,
  deform = true,
  className = '',
  style,
  children,
  ...rest
}: ButtonProps) {
  // Buttons keep vertical page scrolling; horizontal drags still deform them.
  const motion = useDeform({ enabled: deform, touchAction: 'pan-y' });
  return (
    <button
      type="button"
      className={cn(`ui-btn ui-btn--${variant} ui-btn--${size} ${block ? 'ui-btn--block' : ''} ${className}`)}
      style={{ ...motion.style, ...style }}
      {...rest}
      {...motion.handlers}
    >
      <PressGlow pulse={motion.pulse} held={motion.state.active} />
      {icon && (
        <span className={cn('ui-btn__icon')} aria-hidden="true">
          {icon}
        </span>
      )}
      {children && <span>{children}</span>}
    </button>
  );
}

/* ── Card ────────────────────────────────────────────────────────────────── */
export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  padded?: boolean;
}

export function Card({
  title,
  subtitle,
  actions,
  padded = true,
  className = '',
  children,
  ...rest
}: CardProps) {
  return (
    <section
      data-ui="card"
      className={cn(`ui-card ${padded ? 'ui-card--padded' : ''} ${className}`)}
      {...rest}
    >
      {(title || actions) && (
        <header className={cn('ui-card__head')}>
          <div className={cn('ui-card__titles')}>
            {title && <h2 className={cn('ui-card__title')}>{title}</h2>}
            {subtitle && <p className={cn('ui-card__subtitle')}>{subtitle}</p>}
          </div>
          {actions && <div className={cn('ui-card__actions')}>{actions}</div>}
        </header>
      )}
      <div className={cn('ui-card__body')}>{children}</div>
    </section>
  );
}

/* ── Stack / Row ─────────────────────────────────────────────────────────── */
export function Stack({
  gap = 'md',
  className = '',
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement> & { gap?: 'sm' | 'md' | 'lg' }) {
  return (
    <div className={cn(`ui-stack ui-stack--${gap} ${className}`)} {...rest}>
      {children}
    </div>
  );
}

export function Row({ className = '', children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn(`ui-row ${className}`)} {...rest}>
      {children}
    </div>
  );
}

/* ── Segmented control ───────────────────────────────────────────────────── */
export interface SegmentOption<T extends string> {
  value: T;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const clampPercent = (value: number) => clamp(value, 0, 100);

/**
 * iOS-style segmented control. The selected pill is the drag surface: pressing
 * it gives press feedback, dragging moves it freely with the pointer, and
 * release snaps it to the nearest slot and selects that option. Pressing any
 * other slot only slides the pill there — no press feedback on the pill.
 */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
  deform = true,
}: {
  options: SegmentOption<T>[];
  value: T;
  onChange: (v: T) => void;
  label?: string;
  deform?: boolean;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ startX: number; baseLeft: number } | null>(null);
  // Render the pill only once measured, so it mounts at its final size
  // instead of transitioning in from zero on first paint.
  const [slots, setSlots] = useState<Array<{ left: number; width: number }> | null>(null);
  const [dragOffset, setDragOffset] = useState<number | null>(null);
  const [glow, setGlow] = useState({ x: 50, y: 50, held: false });
  const glowTimer = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (glowTimer.current !== null) window.clearTimeout(glowTimer.current);
    },
    [],
  );
  const reduced = usePrefersReducedMotion();
  const motion = useDeform({ enabled: deform, axis: 'x', touchAction: 'pan-y' });
  const activeIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );
  const geometry = slots?.[activeIndex] ?? { left: 0, width: 0 };

  // Measure every slot, not just the active one: the pill needs the other
  // positions to snap on release, and labels can have different widths.
  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const measure = () => {
      const buttons = [...track.querySelectorAll<HTMLElement>('[data-index]')];
      if (!buttons.length) return;
      const trackLeft = track.getBoundingClientRect().left;
      setSlots(
        buttons.map((button) => {
          const rect = button.getBoundingClientRect();
          return { left: rect.left - trackLeft, width: rect.width };
        }),
      );
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    track.querySelectorAll('button').forEach((button) => observer.observe(button));
    return () => observer.disconnect();
  }, [value, options]);

  const pressedIndex = (event: ReactPointerEvent<HTMLDivElement>) => {
    const hit = (event.target as HTMLElement).closest<HTMLElement>('[data-index]');
    return hit ? Number(hit.dataset.index) : -1;
  };

  const relativeTo = (element: HTMLElement | null, x: number, y: number) => {
    if (!element) return { x: 50, y: 50 };
    const rect = element.getBoundingClientRect();
    return {
      x: clampPercent(((x - rect.left) / (rect.width || 1)) * 100),
      y: clampPercent(((y - rect.top) / (rect.height || 1)) * 100),
    };
  };

  const spark = (position = { x: 50, y: 50 }, held = true) => {
    if (glowTimer.current !== null) {
      window.clearTimeout(glowTimer.current);
      glowTimer.current = null;
    }
    setGlow((current) => ({ ...position, held }));
  };

  /** Clicking a target slot keeps the bloom alive briefly, then returns to the
      pill's resting halo instead of vanishing with a one-shot animation. */
  const sparkTarget = () => {
    spark();
    glowTimer.current = window.setTimeout(() => {
      setGlow((current) => ({ ...current, held: false }));
      glowTimer.current = null;
    }, 600);
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    const index = pressedIndex(event);
    const option = options[index];
    // Only the selected pill is draggable. Pressing another slot must not
    // light up the pill; its native click simply slides the pill there.
    if (!deform || index !== activeIndex || !option || option.disabled) return;
    motion.handlers.onPointerDown(event);
    spark(relativeTo(event.target as HTMLElement, event.clientX, event.clientY), true);
    drag.current = { startX: event.clientX, baseLeft: geometry.left };
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag.current || !slots?.length) return;
    motion.handlers.onPointerMove(event);
    const minLeft = slots[0].left;
    const maxLeft = slots[slots.length - 1].left;
    setDragOffset(
      clamp(
        event.clientX - drag.current.startX,
        minLeft - drag.current.baseLeft,
        maxLeft - drag.current.baseLeft,
      ),
    );
    // The spotlight follows the finger inside the pill as it is dragged.
    const position = relativeTo(thumbRef.current, event.clientX, event.clientY);
    setGlow((current) => ({ ...current, ...position }));
  };

  const onEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    motion.handlers.onPointerUp(event);
    // Snap to the slot under the released pointer, not the pill's centre —
    // that is where the user's finger actually is.
    const trackLeft = trackRef.current?.getBoundingClientRect().left ?? 0;
    const pointerX =
      event.type === 'pointercancel'
        ? drag.current.baseLeft + (dragOffset ?? 0) + geometry.width / 2
        : event.clientX - trackLeft;
    let nearest = 0;
    let distance = Infinity;
    slots?.forEach((slot, index) => {
      const delta = Math.abs(slot.left + slot.width / 2 - pointerX);
      if (delta < distance) {
        distance = delta;
        nearest = index;
      }
    });
    const option = options[nearest];
    if (option && !option.disabled && option.value !== value) onChange(option.value);
    drag.current = null;
    setDragOffset(null);
    if (glowTimer.current !== null) {
      window.clearTimeout(glowTimer.current);
      glowTimer.current = null;
    }
    setGlow((current) => ({ ...current, held: false }));
  };

  const dragging = dragOffset !== null;
  const thumbStyle = {
    ...motion.style,
    left: geometry.left + (dragOffset ?? 0),
    width: geometry.width,
    transition:
      dragging || motion.state.active || reduced
        ? 'none'
        : `left var(--dur) var(--ease), width var(--dur) var(--ease), transform var(--spring-dur) var(--spring-ease)`,
  } as CSSProperties;

  return (
    <div
      ref={trackRef}
      className={cn('ui-segmented')}
      role="tablist"
      aria-label={label}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onEnd}
      onPointerCancel={onEnd}
    >
      {slots && (
        <div ref={thumbRef} className={cn('ui-segmented__thumb')} style={thumbStyle}>
          <span
            className={cn(`ui-segmented__sheen ${glow.held ? 'is-held' : ''}`)}
            aria-hidden="true"
          />
          <span
            className={cn(`ui-segmented__spot ${glow.held ? 'is-held' : ''}`)}
            style={
              {
                '--seg-glow-x': `${glow.x}%`,
                '--seg-glow-y': `${glow.y}%`,
              } as CSSProperties
            }
            aria-hidden="true"
          />
        </div>
      )}
      {options.map((o, index) => {
        const semantics = tabSemantics(o, value);
        return (
          <button
            key={o.value}
            type="button"
            role={semantics.role}
            data-index={index}
            data-active={value === o.value}
            aria-selected={semantics.selected}
            aria-disabled={semantics.disabled || undefined}
            aria-label={semantics.label}
            tabIndex={o.value === value ? 0 : -1}
            className={cn(`ui-segmented__item ${value === o.value ? 'is-active' : ''}`)}
            onClick={() => {
              if (o.disabled) return;
              if (index !== activeIndex) sparkTarget();
              onChange(o.value);
            }}
            onKeyDown={(event) => {
              const current = options.findIndex((item) => item.value === value);
              let next: number | undefined;
              if (event.key === 'ArrowRight') next = (current + 1) % options.length;
              if (event.key === 'ArrowLeft') next = (current - 1 + options.length) % options.length;
              if (event.key === 'Home') next = 0;
              if (event.key === 'End') next = options.length - 1;
              if (next === undefined) return;
              event.preventDefault();
              const option = options[next];
              if (option && !option.disabled) {
                if (next !== activeIndex) sparkTarget();
                onChange(option.value);
              }
            }}
          >
            {o.icon && <span aria-hidden="true">{o.icon}</span>}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/* ── Slider row ──────────────────────────────────────────────────────────── */
export function SliderRow({
  label,
  min,
  max,
  step,
  value,
  fmt,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  fmt: (v: number) => string;
  onChange: (v: number) => void;
}) {
  return (
    <label className={cn('ui-slider')}>
      <span className={cn('ui-slider__top')}>
        <span className={cn('ui-slider__label')}>{label}</span>
        <output className={cn('ui-slider__value')}>{fmt(value)}</output>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}

/* ── Switch ──────────────────────────────────────────────────────────────── */
export function Switch({
  checked,
  onChange,
  label,
  deform = true,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  deform?: boolean;
}) {
  const semantics = toggleSemantics({ checked }, label);
  return (
    <Deformable enabled={deform} touchAction="pan-y">
      <button
        type="button"
        role={semantics.role}
        aria-checked={semantics.checked}
        aria-label={semantics.label}
        className={cn(`ui-switch ${checked ? 'is-on' : ''}`)}
        onClick={() => onChange(toggleReducer({ checked }, { type: 'toggle' }).checked)}
      >
        <span className={cn('ui-switch__knob')} />
      </button>
    </Deformable>
  );
}

/* ── Field / Select / TextInput ──────────────────────────────────────────── */
export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className={cn('ui-field')}>
      <span className={cn('ui-field__label')}>{label}</span>
      {children}
      {hint && <span className={cn('ui-field__hint')}>{hint}</span>}
    </label>
  );
}

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
      className={cn(`ui-select__wrap ${className}`)}
      style={{ zIndex: state.open ? 50 : undefined }}
    >
      <button
        id={id}
        ref={triggerRef}
        type="button"
        className={cn(`ui-select ui-select--trigger ${state.open ? 'is-open' : ''}`)}
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
        <span className={cn('ui-select__value')}>
          {selected ? (
            <>
              {selected.leading}
              <span>{selected.label}</span>
            </>
          ) : (
            <span className={cn('ui-select__placeholder')}>{placeholder}</span>
          )}
        </span>
        <span className={cn('ui-select__chevron')} aria-hidden="true">
          ⌄
        </span>
      </button>

      {state.open && (
        <div
          ref={listRef}
          id={listId}
          role="listbox"
          aria-label={accessibleLabel}
          className={cn('ui-select__menu')}
        >
          {list.length === 0 && <div className={cn('ui-select__empty')}>No options</div>}
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
                className={cn(`ui-select__option ${index === state.activeIndex ? 'is-active' : ''}`)}
                onPointerEnter={() => !option.disabled && dispatch({ type: 'setActive', index })}
                onClick={() => choose(option)}
              >
                {option.leading && (
                  <span className={cn('ui-select__leading')} aria-hidden="true">
                    {option.leading}
                  </span>
                )}
                <span className={cn('ui-select__option-label')}>{option.label}</span>
                {option.trailing ??
                  (optionState.selected ? (
                    <span className={cn('ui-select__check')} aria-hidden="true">
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

export function TextInput({
  className = '',
  ...rest
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(`ui-input ${className}`)} {...rest} />;
}

/* ── Stat / StatusStat / EmptyState ──────────────────────────────────────── */
export function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: ReactNode;
  tone?: 'accent' | 'success' | 'danger';
}) {
  return (
    <div className={cn('ui-stat')}>
      <strong className={cn(tone ? `ui-stat__value is-${tone}` : 'ui-stat__value')}>
        {value}
      </strong>
      <span className={cn('ui-stat__label')}>{label}</span>
    </div>
  );
}

/**
 * Status colors are fixed (green = success, red = failure) and never follow
 * the decorative mood accent — success must be recognizable in every mood.
 */
export function StatusStat({
  label,
  value,
  status,
}: {
  label: string;
  value: ReactNode;
  status: 'success' | 'danger' | 'neutral';
}) {
  const icon = status === 'success' ? '✓' : status === 'danger' ? '✕' : '·';
  return (
    <div className={cn('ui-status-stat')}>
      <span className={cn(`ui-status-stat__value is-${status}`)}>
        <span className={cn('ui-status-stat__icon')} aria-hidden="true">
          {icon}
        </span>
        {value}
      </span>
      <span className={cn('ui-status-stat__label')}>{label}</span>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  detail,
}: {
  icon?: ReactNode;
  title: string;
  detail?: string;
}) {
  return (
    <div className={cn('ui-empty')}>
      {icon && (
        <div className={cn('ui-empty__icon')} aria-hidden="true">
          {icon}
        </div>
      )}
      <p className={cn('ui-empty__title')}>{title}</p>
      {detail && <p className={cn('ui-empty__detail')}>{detail}</p>}
    </div>
  );
}

/* ── Sheet ───────────────────────────────────────────────────────────────── */
export function Sheet({
  open,
  onClose,
  title,
  children,
  style,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  style?: CSSProperties;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    restoreRef.current = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      restoreRef.current?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;
  const semantics = sheetSemantics({ presented: open }, typeof title === 'string' ? title : undefined);
  return (
    <div
      className={cn('ui-sheet')}
      role={semantics.role}
      aria-modal={semantics.modal}
      aria-label={semantics.label}
    >
      <div className={cn('ui-sheet__scrim')} onClick={onClose} />
      <div className={cn('ui-sheet__panel')} style={style}>
        <div className={cn('ui-sheet__grabber')} aria-hidden="true" />
        <header className={cn('ui-sheet__head')}>
          <h2>{title}</h2>
          <button
            ref={closeRef}
            type="button"
            className={cn('ui-btn ui-btn--plain ui-btn--compact')}
            aria-label="Close"
            onClick={onClose}
          >
            ✕
          </button>
        </header>
        <div className={cn('ui-sheet__body')}>{children}</div>
      </div>
    </div>
  );
}
