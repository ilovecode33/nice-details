import styles from './TextArea.module.css';

import { type TextareaHTMLAttributes } from 'react';

/**
 * Native multi-line text input with field-state styling. Forwards all textarea
 * attributes; labels and placeholder come from the caller.
 *
 * @example
 * ```tsx
 * import { FormField, TextArea } from '@ilovecode33/ui';
 *
 * <FormField label="Notes" hint="Optional description">
 *   <TextArea id="notes" name="notes" rows={4} placeholder="Add notes" />
 * </FormField>
 * ```
 */
export function TextArea({
  className = '',
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={[styles['ui-textarea'], className].filter(Boolean).join(' ')} {...rest} />;
}
