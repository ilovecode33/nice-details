import { type HTMLAttributes } from 'react';

/** Vertical layout container. */

export function Stack({
  gap = 'md',
  className = '',
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement> & { gap?: 'sm' | 'md' | 'lg' }) {
  return (
    <div className={className} data-ui={`stack stack--${gap}`} {...rest}>
      {children}
    </div>
  );
}
