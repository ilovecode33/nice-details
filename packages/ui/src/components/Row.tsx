import styles from './Row.module.css';
import { type HTMLAttributes, type ReactNode } from 'react';


/** Layout primitives: Card, Stack, Row. */

export function Row({ className = '', children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={[styles['ui-row'], className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </div>
  );
}