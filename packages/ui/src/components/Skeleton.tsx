import styles from './Skeleton.module.css';

import { type CSSProperties } from 'react';

/**
 * Decorative shimmer placeholder for loading states, hidden from assistive
 * technology. `width` and `height` default to 100% and 16px.
 */
export function Skeleton({
  width = '100%',
  height = '16px',
}: {
  width?: string;
  height?: string;
}) {
  return (
    <span
      className={styles['ui-skeleton']}
      aria-hidden="true"
      style={{ width, height } as CSSProperties}
    />
  );
}
