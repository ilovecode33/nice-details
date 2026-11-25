import styles from './StatusStat.module.css';
import { Check, Minus, X } from 'lucide-react';
import { type ReactNode } from 'react';

/** Status stat with fixed success and danger colors. */
/**
 * Status colors are fixed (green = success, red = failure) and never follow
 * the decorative mood accent — success must be recognizable in every mood.
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
