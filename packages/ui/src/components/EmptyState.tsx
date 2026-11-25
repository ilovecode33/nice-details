import styles from './EmptyState.module.css';

import { type ReactNode } from 'react';

/**
 * Placeholder shown when a collection has no items: an optional decorative icon
 * hidden from assistive tech, a title and an optional detail line. All text is
 * supplied by the caller through props; there are no built-in label defaults.
 */
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
