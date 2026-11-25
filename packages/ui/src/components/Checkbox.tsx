import classes from './Checkbox.module.css';
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
import { createCn } from '../css';

const cn = createCn(classes);

/**
 * Data-entry components. Validation state follows the `FormFieldState`
 * contract in `@ilovecode33/ui-core`, so a native renderer can use the same
 * touched / error model.
 */

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
