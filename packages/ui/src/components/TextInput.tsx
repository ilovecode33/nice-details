import styles from './TextInput.module.css';

import { type InputHTMLAttributes } from 'react';

/**
 * Native single-line text input with field-state styling. Forwards all input
 * attributes; labels and placeholder come from the caller.
 */
export function TextInput({
  className = '',
  ...rest
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={[styles['ui-input'], className].filter(Boolean).join(' ')} {...rest} />;
}
