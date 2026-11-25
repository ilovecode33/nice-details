import styles from './DatePicker.module.css';

import { type InputHTMLAttributes } from 'react';

/** Native date input with field-state styling. */

export function DatePicker({
  className = '',
  ...rest
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input type="date" className={[styles['ui-input'], className].filter(Boolean).join(' ')} {...rest} />;
}
