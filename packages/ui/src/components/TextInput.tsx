import styles from './TextInput.module.css';

import { type InputHTMLAttributes } from 'react';

/** Single-line text input with field-state styling. */

export function TextInput({
  className = '',
  ...rest
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={[styles['ui-input'], className].filter(Boolean).join(' ')} {...rest} />;
}
