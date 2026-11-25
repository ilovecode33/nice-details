import { type HTMLAttributes } from 'react';

/**
 * Vertical layout container that maps `gap` to a data attribute for styling
 * and forwards all other div attributes. Defaults to the `md` gap.
 */
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
