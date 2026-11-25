/** Lightweight form controls: SliderRow, Switch, Field, TextInput. */
import { toggleReducer, toggleSemantics } from '@ilovecode33/ui-core';
import { type InputHTMLAttributes, type ReactNode } from 'react';
import { Deformable } from './motion';
import { cn } from './css';

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

/* ── Field / TextInput ──────────────────────────────────────────────────── */
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

export function TextInput({
  className = '',
  ...rest
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(`ui-input ${className}`)} {...rest} />;
}
