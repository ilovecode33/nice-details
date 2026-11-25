import styles from './Row.module.css';
import { type HTMLAttributes } from 'react';

/** Horizontal layout container. */

export function Row({ className = '', children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={[styles['ui-row'], className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </div>
  );
}
