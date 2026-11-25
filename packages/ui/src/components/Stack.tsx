import styles from './Stack.module.css';
import { type HTMLAttributes } from 'react';

/** Vertical layout container. */

export function Stack({
  gap = 'md',
  className = '',
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement> & { gap?: 'sm' | 'md' | 'lg' }) {
  return (
    <div className={[styles['ui-stack'], styles[`ui-stack--${gap}`], className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </div>
  );
}
