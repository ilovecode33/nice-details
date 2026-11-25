/** Layout primitives: Card, Stack, Row. */
import { type HTMLAttributes, type ReactNode } from 'react';
import classes from './styles/layout.module.css';
import { createCn } from './css';
const cn = createCn(classes);

/* ── Card ────────────────────────────────────────────────────────────────── */
export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  padded?: boolean;
}

export function Card({
  title,
  subtitle,
  actions,
  padded = true,
  className = '',
  children,
  ...rest
}: CardProps) {
  return (
    <section
      data-ui="card"
      className={cn(`ui-card ${padded ? 'ui-card--padded' : ''} ${className}`)}
      {...rest}
    >
      {(title || actions) && (
        <header className={cn('ui-card__head')}>
          <div className={cn('ui-card__titles')}>
            {title && <h2 className={cn('ui-card__title')}>{title}</h2>}
            {subtitle && <p className={cn('ui-card__subtitle')}>{subtitle}</p>}
          </div>
          {actions && <div className={cn('ui-card__actions')}>{actions}</div>}
        </header>
      )}
      <div className={cn('ui-card__body')}>{children}</div>
    </section>
  );
}

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

export function Row({ className = '', children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn(`ui-row ${className}`)} {...rest}>
      {children}
    </div>
  );
}
