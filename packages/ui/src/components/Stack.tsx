import classes from './Stack.module.css';
import { type HTMLAttributes, type ReactNode } from 'react';
import { createCn } from '../css';

const cn = createCn(classes);

/** Layout primitives: Card, Stack, Row. */

/* ── Stack / Row ─────────────────────────────────────────────────────────── */
export function Stack({
  gap = 'md',
  className = '',
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement> & { gap?: 'sm' | 'md' | 'lg' }) {
  return (
    <div className={cn(`ui-stack ui-stack--${gap} ${className}`)} {...rest}>
      {children}
    </div>
  );
}
