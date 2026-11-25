import styles from './NumberField.module.css';

import { type InputHTMLAttributes } from 'react';

/**
 * Native `type="number"` input with `inputMode="decimal"` and field-state
 * styling. Value and behaviour are governed entirely by the forwarded input
 * attributes; the control supplies no text or label of its own.
 */

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
