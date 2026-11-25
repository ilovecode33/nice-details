import { type HTMLAttributes } from 'react';

/** Horizontal layout container. */

export function Row({ className = '', children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={className} data-ui="row" {...rest}>
      {children}
    </div>
  );
}
