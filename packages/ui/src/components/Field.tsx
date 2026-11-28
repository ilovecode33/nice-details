import styles from './Field.module.css';

import { type MouseEvent, type ReactNode } from 'react';

/**
 * Inline `label` wrapper for compact form rows: a label, the control and an
 * optional hint. All text is passed in via props; no labels are built in.
 * Clicking the label text names the row but does not activate a Select or a
 * Switch inside it — opening a menu or toggling from the caption is too easy
 * to trigger by accident while scrolling.
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
  const onLabelClick = (event: MouseEvent<HTMLLabelElement>) => {
    const control = event.currentTarget.querySelector(
      '[role="combobox"], [role="switch"]',
    );
    // Let clicks on the control itself through; only the surrounding caption
    // and hint stop the native label activation.
    if (!control || control.contains(event.target as Node)) return;
    event.preventDefault();
  };

  return (
    <label className={styles['ui-field']} onClick={onLabelClick}>
      <span className={styles['ui-field__label']}>{label}</span>
      {children}
      {hint && <span className={styles['ui-field__hint']}>{hint}</span>}
    </label>
  );
}
