import styles from './TextArea.module.css';

import { type TextareaHTMLAttributes } from 'react';

/** Multi-line text input with field-state styling. */

export function TextArea({
  className = '',
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={[styles['ui-textarea'], className].filter(Boolean).join(' ')} {...rest} />;
}
