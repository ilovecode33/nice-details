import styles from './Field.module.css';

import { type ReactNode } from 'react';

/** Inline field wrapper for compact form rows. */
export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className={styles['ui-field']}>
      <span className={styles['ui-field__label']}>{label}</span>
      {children}
      {hint && <span className={styles['ui-field__hint']}>{hint}</span>}
    </label>
  );
}
