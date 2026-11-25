import styles from './Stat.module.css';
import { Check, Minus, X } from 'lucide-react';
import { type ReactNode } from 'react';


/** Compact value display: Stat, StatusStat, EmptyState. */

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
    <div className={'ui-stat'}>
      <strong className={(tone ? [styles['ui-stat__value'], styles[`is-${tone}`]].filter(Boolean).join(' ') : styles['ui-stat__value'])}>
        {value}
      </strong>
      <span className={styles['ui-stat__label']}>{label}</span>
    </div>
  );
}
