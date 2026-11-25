import styles from './StatusStat.module.css';
import { Check, Minus, X } from 'lucide-react';
import { type ReactNode } from 'react';

/**
 * Status stat pairing a value and label with a status icon and color.
 * Success/danger colors stay fixed rather than following the theme accent.
 * `label` and `value` are supplied by props; the icon is decorative.
 */
export function StatusStat({
  label,
  value,
  status,
}: {
  label: string;
  value: ReactNode;
  status: 'success' | 'danger' | 'neutral';
}) {
  const icon =
    status === 'success' ? <Check /> : status === 'danger' ? <X /> : <Minus />;
  return (
    <div className={styles['ui-status-stat']}>
      <span className={[styles['ui-status-stat__value'], styles[`is-${status}`]].filter(Boolean).join(' ')}>
        <span className={styles['ui-status-stat__icon']} aria-hidden="true">
          {icon}
        </span>
        {value}
      </span>
      <span className={styles['ui-status-stat__label']}>{label}</span>
    </div>
  );
}
