/**
 * Data-entry components. Validation state follows the `FormFieldState`
 * contract in `@ilovecode33/ui-core`, so a native renderer can use the same
 * touched / error model.
 */

import {
  checkboxSemantics,
  fieldSemantics,
  radioSemantics,
} from '@ilovecode33/ui-core';
import { Deformable } from './motion';
import {
  cloneElement,
  isValidElement,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from 'react';
import formsClasses from './styles/forms.module.css';
import selectClasses from './styles/select.module.css';
import { createCn } from './css';
const cn = createCn(formsClasses, selectClasses);

/* ── FormField ─────────────────────────────────────────────────────────────── */

type FieldControlProps = {
  id: string;
  'aria-describedby': string | undefined;
  'aria-invalid': boolean | undefined;
};

export function FormField({
  label,
  hint,
  error,
  id,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  id?: string;
  children: ReactNode | ((props: FieldControlProps) => ReactNode);
}) {
  const generated = useId();
  const controlId = id ?? generated;
  const errorId = `${controlId}-error`;
  const semantics = fieldSemantics(
    { value: '', touched: Boolean(error), error },
    label,
    errorId,
  );
  const controlProps: FieldControlProps = {
    id: controlId,
    'aria-describedby': semantics.describedBy,
    'aria-invalid': semantics.invalid || undefined,
  };

  let control: ReactNode;
  if (typeof children === 'function') {
    control = children(controlProps);
  } else if (isValidElement(children)) {
    control = cloneElement(children as React.ReactElement<FieldControlProps>, {
      id: controlId,
      'aria-describedby': semantics.describedBy,
      'aria-invalid': semantics.invalid || undefined,
    });
  } else {
    control = children;
  }

  return (
    <div className={cn('ui-formfield')}>
      <label className={cn('ui-formfield__label')} htmlFor={controlId}>
        {label}
      </label>
      {control}
      {error ? (
        <p id={errorId} className={cn('ui-formfield__error')} role="alert">
          <span aria-hidden="true">✕</span> {error}
        </p>
      ) : (
        hint && <p className={cn('ui-formfield__hint')}>{hint}</p>
      )}
    </div>
  );
}

/* ── TextArea / NumberField / SearchBar / DatePicker ──────────────────────── */

export function TextArea({
  className = '',
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(`ui-textarea ${className}`)} {...rest} />;
}

export function NumberField({
  className = '',
  ...rest
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="number"
      inputMode="decimal"
      className={cn(`ui-input ${className}`)}
      {...rest}
    />
  );
}

export function DatePicker({
  className = '',
  ...rest
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input type="date" className={cn(`ui-input ${className}`)} {...rest} />;
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Search...',
  label = 'Search',
  clearLabel = 'Clear search',
  onClear,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  clearLabel?: string;
  onClear?: () => void;
}) {
  return (
    <div className={cn('ui-searchbar')}>
      <span className={cn('ui-searchbar__icon')} aria-hidden="true">
        ⌕
      </span>
      <input
        type="search"
        className={cn('ui-searchbar__input')}
        value={value}
        placeholder={placeholder}
        aria-label={label}
        onChange={(event) => onChange(event.target.value)}
      />
      {value && (
        <button
          type="button"
          className={cn('ui-searchbar__clear')}
          aria-label={clearLabel}
          onClick={() => {
            onChange('');
            onClear?.();
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
}

/* ── Checkbox / RadioGroup ────────────────────────────────────────────────── */

export function Checkbox({
  checked,
  onChange,
  label,
  deform = true,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  deform?: boolean;
}) {
  const semantics = checkboxSemantics(checked, label);
  return (
    <Deformable enabled={deform} touchAction="pan-y">
      <label className={cn('ui-checkbox')}>
        <button
          type="button"
          role={semantics.role}
          aria-checked={semantics.checked}
          aria-label={semantics.label}
          className={cn(`ui-checkbox__box ${checked ? 'is-checked' : ''}`)}
          onClick={() => onChange(!checked)}
        >
          {checked && <span aria-hidden="true">✓</span>}
        </button>
        <span>{label}</span>
      </label>
    </Deformable>
  );
}

export interface RadioOption<T extends string = string> {
  value: T;
  label: string;
}

export function RadioGroup<T extends string = string>({
  options,
  value,
  onChange,
  label,
}: {
  options: Array<RadioOption<T>>;
  value: T;
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <div className={cn('ui-radio')} role="radiogroup" aria-label={label}>
      {options.map((option) => {
        const checked = option.value === value;
        const semantics = radioSemantics(checked, option.label);
        return (
          <button
            key={option.value}
            type="button"
            role={semantics.role}
            aria-checked={semantics.checked}
            aria-label={semantics.label}
            tabIndex={checked ? 0 : -1}
            className={cn(`ui-radio__option ${checked ? 'is-checked' : ''}`)}
            onClick={() => onChange(option.value)}
            onKeyDown={(event) => {
              if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
              event.preventDefault();
              const index = options.findIndex((item) => item.value === value);
              const delta = event.key === 'ArrowDown' ? 1 : -1;
              const next = options[(index + delta + options.length) % options.length];
              if (next) onChange(next.value);
            }}
          >
            <span className={cn('ui-radio__dot')} aria-hidden="true" />
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ── Stepper ───────────────────────────────────────────────────────────────── */

export function Stepper({
  value,
  onChange,
  min = 0,
  max = 99,
  step = 1,
  label,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label: string;
}) {
  const clamp = (n: number) => Math.min(Math.max(n, min), max);
  return (
    <div className={cn('ui-stepper')} role="group" aria-label={label}>
      <button
        type="button"
        className={cn('ui-stepper__button')}
        aria-label={`Decrease ${label}`}
        disabled={value <= min}
        onClick={() => onChange(clamp(value - step))}
      >
        −
      </button>
      <output className={cn('ui-stepper__value')} aria-live="polite">
        {value}
      </output>
      <button
        type="button"
        className={cn('ui-stepper__button')}
        aria-label={`Increase ${label}`}
        disabled={value >= max}
        onClick={() => onChange(clamp(value + step))}
      >
        ＋
      </button>
    </div>
  );
}
