import classes from './Row.module.css';
import { type HTMLAttributes, type ReactNode } from 'react';
import { createCn } from '../css';

const cn = createCn(classes);

/** Layout primitives: Card, Stack, Row. */

export function Row({ className = '', children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn(`ui-row ${className}`)} {...rest}>
      {children}
    </div>
  );
}
