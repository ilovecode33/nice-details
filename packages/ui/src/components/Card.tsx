import type { CardProps } from '@ilovecode33/ui-types';
import styles from './Card.module.css';
import { type HTMLAttributes, type ReactNode } from 'react';



/** Layout primitives: Card, Stack, Row. */

/* ── Card ────────────────────────────────────────────────────────────────── */
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
      className={[styles['ui-card'], styles[padded ? 'ui-card--padded' : ''] || '', className].filter(Boolean).join(' ')}
      {...rest}
    >
      {(title || actions) && (
        <header className={styles['ui-card__head']}>
          <div className={styles['ui-card__titles']}>
            {title && <h2 className={styles['ui-card__title']}>{title}</h2>}
            {subtitle && <p className={styles['ui-card__subtitle']}>{subtitle}</p>}
          </div>
          {actions && <div className={styles['ui-card__actions']}>{actions}</div>}
        </header>
      )}
      <div className={styles['ui-card__body']}>{children}</div>
    </section>
  );
}
