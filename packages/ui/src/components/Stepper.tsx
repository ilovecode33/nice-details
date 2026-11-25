import styles from './Stepper.module.css';
import {
  checkboxSemantics,
  fieldSemantics,
  radioSemantics,
} from '@ilovecode33/ui-core';
import { Deformable } from './Deformable';
import {
  cloneElement,
  isValidElement,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from 'react';


/**
 * Data-entry components. Validation state follows the `FormFieldState`
 * contract in `@ilovecode33/ui-core`, so a native renderer can use the same
 * touched / error model.
 */

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
    <div className={styles['ui-stepper']} role="group" aria-label={label}>
      <button
        type="button"
        className={styles['ui-stepper__button']}
        aria-label={`Decrease ${label}`}
        disabled={value <= min}
        onClick={() => onChange(clamp(value - step))}
      >
        −
      </button>
      <output className={styles['ui-stepper__value']} aria-live="polite">
        {value}
      </output>
      <button
        type="button"
        className={styles['ui-stepper__button']}
        aria-label={`Increase ${label}`}
        disabled={value >= max}
        onClick={() => onChange(clamp(value + step))}
      >
        ＋
      </button>
    </div>
  );
}
