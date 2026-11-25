import styles from './Stat.module.css';
import { type ReactNode } from 'react';

/**
 * Compact stat displaying a value above its label, with an optional tone
 * class. `label` and `value` come from props.
 */
export function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: ReactNode;
  tone?: 'accent' | 'success' | 'danger';
}) {
  return (
    <div className={styles['ui-stat']}>
      <strong className={(tone ? [styles['ui-stat__value'], styles[`is-${tone}`]].filter(Boolean).join(' ') : styles['ui-stat__value'])}>
        {value}
      </strong>
      <span className={styles['ui-stat__label']}>{label}</span>
    </div>
  );
}
