import styles from './NumberField.module.css';

import { type InputHTMLAttributes } from 'react';

/** Native number input with field-state styling. */

export function NumberField({
  className = '',
  ...rest
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="number"
      inputMode="decimal"
      className={[styles['ui-input'], className].filter(Boolean).join(' ')}
      {...rest}
    />
  );
}
