import styles from './TextArea.module.css';

import { type TextareaHTMLAttributes } from 'react';

/**
 * Native multi-line text input with field-state styling. Forwards all textarea
 * attributes; labels and placeholder come from the caller.
 */
export function TextArea({
  className = '',
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={[styles['ui-textarea'], className].filter(Boolean).join(' ')} {...rest} />;
}
