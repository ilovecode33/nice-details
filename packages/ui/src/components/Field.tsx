import styles from './Field.module.css';
import { toggleReducer, toggleSemantics } from '@ilovecode33/ui-core';
import { type InputHTMLAttributes, type ReactNode } from 'react';
import { Deformable } from './Deformable';


/** Lightweight form controls: SliderRow, Switch, Field, TextInput. */
/* ── Field / TextInput ──────────────────────────────────────────────────── */
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
