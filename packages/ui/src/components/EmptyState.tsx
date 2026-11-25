import styles from './EmptyState.module.css';
import { Check, Minus, X } from 'lucide-react';
import { type ReactNode } from 'react';


/** Compact value display: Stat, StatusStat, EmptyState. */
export function EmptyState({
  icon,
  title,
  detail,
}: {
  icon?: ReactNode;
  title: string;
  detail?: string;
}) {
  return (
    <div className={styles['ui-empty']}>
      {icon && (
        <div className={styles['ui-empty__icon']} aria-hidden="true">
          {icon}
        </div>
      )}
      <p className={styles['ui-empty__title']}>{title}</p>
      {detail && <p className={styles['ui-empty__detail']}>{detail}</p>}
    </div>
  );
}
