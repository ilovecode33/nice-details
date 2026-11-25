import styles from './Badge.module.css';

import { type ReactNode } from 'react';

/** Small status badge. */

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'neutral' | 'accent' | 'success' | 'danger';
}) {
  return <span className={[styles['ui-badge'], styles[`is-${tone}`]].filter(Boolean).join(' ')}>{children}</span>;
}
