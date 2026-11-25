import { type HTMLAttributes } from 'react';

/**
 * Minimal horizontal layout container forwarding native `div` attributes and a
 * caller-supplied class name. It renders `children` unchanged and provides no
 * text or labels of its own.
 */

export function Row({ className = '', children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={className} data-ui="row" {...rest}>
      {children}
    </div>
  );
}
