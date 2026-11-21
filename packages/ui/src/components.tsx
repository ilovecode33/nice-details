/**
 * Mobile-first UI components.
 *
 * Design basis: Apple HIG principles — clear purpose, 44pt touch targets,
 * readable text, accessible focus, reduced-motion support, and subtle motion.
 * Styles live in styles.css; base rules target a phone, with refinements at
 * `@media (min-width: 768px)`.
 */

import {
  Children,
  isValidElement,
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react';

/* ── Button ──────────────────────────────────────────────────────────────── */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'destructive' | 'plain';
  size?: 'default' | 'compact';
  icon?: ReactNode;
  block?: boolean;
}

export function Button({
  variant = 'secondary',
  size = 'default',
  icon,
  block,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type="button"
      className={`ui-btn ui-btn--${variant} ui-btn--${size} ${block ? 'ui-btn--block' : ''} ${className}`}
      {...rest}
    >
      {icon && (
        <span className="ui-btn__icon" aria-hidden="true">
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
      className={`ui-card ${padded ? 'ui-card--padded' : ''} ${className}`}
      {...rest}
    >
      {(title || actions) && (
        <header className="ui-card__head">
          <div className="ui-card__titles">
            {title && <h2 className="ui-card__title">{title}</h2>}
            {subtitle && <p className="ui-card__subtitle">{subtitle}</p>}
          </div>
          {actions && <div className="ui-card__actions">{actions}</div>}
        </header>
      )}
      <div className="ui-card__body">{children}</div>
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
    <div className={`ui-stack ui-stack--${gap} ${className}`} {...rest}>
      {children}
    </div>
  );
}

export function Row({ className = '', children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`ui-row ${className}`} {...rest}>
      {children}
    </div>
  );
}

/* ── Segmented control ───────────────────────────────────────────────────── */
export interface SegmentOption<T extends string> {
  value: T;
  label: ReactNode;
  icon?: ReactNode;
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: SegmentOption<T>[];
  value: T;
  onChange: (v: T) => void;
  label?: string;
}) {
  return (
    <div className="ui-segmented" role="tablist" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="tab"
          aria-selected={value === o.value}
          className={`ui-segmented__item ${value === o.value ? 'is-active' : ''}`}
          onClick={() => onChange(o.value)}
        >
          {o.icon && <span aria-hidden="true">{o.icon}</span>}
          {o.label}
        </button>
      ))}
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
    <label className="ui-slider">
      <span className="ui-slider__top">
        <span className="ui-slider__label">{label}</span>
        <output className="ui-slider__value">{fmt(value)}</output>
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
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={`ui-switch ${checked ? 'is-on' : ''}`}
      onClick={() => onChange(!checked)}
    >
      <span className="ui-switch__knob" />
    </button>
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
    <label className="ui-field">
      <span className="ui-field__label">{label}</span>
      {children}
      {hint && <span className="ui-field__hint">{hint}</span>}
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
  children,
}: SelectProps<T>) {
  const list = (options ?? (optionsFromChildren(children) as SelectOption<T>[]));
  const [internalValue, setInternalValue] = useState<T | undefined>(defaultValue);
  const currentValue = value !== undefined ? value : internalValue;
  const selected = list.find((o) => o.value === currentValue);

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const enabledIndexes = list.flatMap((o, i) => (o.disabled ? [] : [i]));

  const openList = () => {
    if (disabled) return;
    const currentIndex = list.findIndex((o) => o.value === currentValue);
    setActiveIndex(currentIndex >= 0 ? currentIndex : (enabledIndexes[0] ?? 0));
    setOpen(true);
  };

  const closeList = (focusTrigger = true) => {
    setOpen(false);
    if (focusTrigger) triggerRef.current?.focus();
  };

  const choose = (option: SelectOption<T>) => {
    if (option.disabled) return;
    if (value === undefined) setInternalValue(option.value);
    onChange?.({ target: { value: option.value } });
    closeList();
  };

  const move = (direction: 1 | -1) => {
    if (enabledIndexes.length === 0) return;
    const position = enabledIndexes.indexOf(activeIndex);
    const next =
      position === -1
        ? 0
        : (position + direction + enabledIndexes.length) % enabledIndexes.length;
    setActiveIndex(enabledIndexes[next]);
  };

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, open]);

  const onTriggerKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!open) {
        openList();
        if (event.key === 'ArrowUp') setActiveIndex(enabledIndexes.at(-1) ?? 0);
      } else {
        move(event.key === 'ArrowDown' ? 1 : -1);
      }
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (!open) openList();
      else {
        const option = list[activeIndex];
        if (option) choose(option);
      }
      return;
    }

    if (event.key === 'Escape' && open) {
      event.preventDefault();
      closeList();
      return;
    }

    if (event.key === 'Tab' && open) setOpen(false);
  };

  const accessibleLabel = ariaLabel ?? label;

  return (
    <div ref={wrapRef} className={`ui-select__wrap ${className}`}>
      <button
        id={id}
        ref={triggerRef}
        type="button"
        className={`ui-select ui-select--trigger ${open ? 'is-open' : ''}`}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-activedescendant={open ? `${listId}-${activeIndex}` : undefined}
        aria-label={accessibleLabel}
        aria-disabled={disabled || undefined}
        disabled={disabled}
        onClick={() => (open ? closeList(false) : openList())}
        onKeyDown={onTriggerKeyDown}
      >
        <span className="ui-select__value">
          {selected ? (
            <>
              {selected.leading}
              <span>{selected.label}</span>
            </>
          ) : (
            <span className="ui-select__placeholder">{placeholder}</span>
          )}
        </span>
        <span className="ui-select__chevron" aria-hidden="true">
          ⌄
        </span>
      </button>

      {open && (
        <div
          ref={listRef}
          id={listId}
          role="listbox"
          aria-label={accessibleLabel}
          className="ui-select__menu"
        >
          {list.length === 0 && <div className="ui-select__empty">No options</div>}
          {list.map((option, index) => (
            <button
              type="button"
              key={option.value}
              id={`${listId}-${index}`}
              data-index={index}
              role="option"
              tabIndex={-1}
              aria-selected={option.value === currentValue}
              aria-disabled={option.disabled || undefined}
              aria-label={option.textValue}
              className={`ui-select__option ${index === activeIndex ? 'is-active' : ''}`}
              onPointerEnter={() => !option.disabled && setActiveIndex(index)}
              onClick={() => choose(option)}
            >
              {option.leading && (
                <span className="ui-select__leading" aria-hidden="true">
                  {option.leading}
                </span>
              )}
              <span className="ui-select__option-label">{option.label}</span>
              {option.trailing ??
                (option.value === currentValue ? (
                  <span className="ui-select__check" aria-hidden="true">
                    ✓
                  </span>
                ) : null)}
            </button>
          ))}
        </div>
      )}

      {name && <input type="hidden" name={name} value={currentValue ?? ''} />}
    </div>
  );
}

export function TextInput({
  className = '',
  ...rest
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`ui-input ${className}`} {...rest} />;
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
    <div className="ui-stat">
      <strong className={tone ? `ui-stat__value is-${tone}` : 'ui-stat__value'}>
        {value}
      </strong>
      <span className="ui-stat__label">{label}</span>
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
    <div className="ui-status-stat">
      <span className={`ui-status-stat__value is-${status}`}>
        <span className="ui-status-stat__icon" aria-hidden="true">
          {icon}
        </span>
        {value}
      </span>
      <span className="ui-status-stat__label">{label}</span>
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
    <div className="ui-empty">
      {icon && (
        <div className="ui-empty__icon" aria-hidden="true">
          {icon}
        </div>
      )}
      <p className="ui-empty__title">{title}</p>
      {detail && <p className="ui-empty__detail">{detail}</p>}
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
  if (!open) return null;
  return (
    <div
      className="ui-sheet"
      role="dialog"
      aria-modal="true"
      aria-label={typeof title === 'string' ? title : undefined}
    >
      <div className="ui-sheet__scrim" onClick={onClose} />
      <div className="ui-sheet__panel" style={style}>
        <div className="ui-sheet__grabber" aria-hidden="true" />
        <header className="ui-sheet__head">
          <h2>{title}</h2>
          <Button variant="plain" size="compact" onClick={onClose} aria-label="Close">
            ✕
          </Button>
        </header>
        <div className="ui-sheet__body">{children}</div>
      </div>
    </div>
  );
}
