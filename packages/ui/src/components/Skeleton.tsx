import styles from './Skeleton.module.css';

import { type CSSProperties } from 'react';

/** Shimmering placeholder block for loading states. */
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
