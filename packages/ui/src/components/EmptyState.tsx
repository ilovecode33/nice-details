import styles from './EmptyState.module.css';

import { type ReactNode } from 'react';

/** Placeholder shown when a collection has no items. */
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
