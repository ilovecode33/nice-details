import styles from './Field.module.css';

import { type ReactNode } from 'react';

/**
 * Inline `label` wrapper for compact form rows: a label, the control and an
 * optional hint. All text is passed in via props; no labels are built in.
 */
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
