import classes from './SliderRow.module.css';
import { toggleReducer, toggleSemantics } from '@ilovecode33/ui-core';
import { type InputHTMLAttributes, type ReactNode } from 'react';
import { Deformable } from './Deformable';
import { createCn } from '../css';

const cn = createCn(classes);

/** Lightweight form controls: SliderRow, Switch, Field, TextInput. */

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
