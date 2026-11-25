import styles from './DatePicker.module.css';

import { type InputHTMLAttributes } from 'react';

/**
 * Renders a native date input with field-state styling.
 * All `InputHTMLAttributes` are forwarded to the underlying `<input type="date">`,
 * with `className` appended after the component's own class. No labels are built in.
 */

export function DatePicker({
  className = '',
  ...rest
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input type="date" className={[styles['ui-input'], className].filter(Boolean).join(' ')} {...rest} />;
}
