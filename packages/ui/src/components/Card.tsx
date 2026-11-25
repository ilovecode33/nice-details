import type { CardProps } from '@ilovecode33/ui-types';
import styles from './Card.module.css';

/**
 * Renders a container surface with an optional header and a content body.
 * The header is skipped unless `title` or `actions` is provided, so a `subtitle`
 * alone is not rendered. `padded` defaults to true; extra props reach the `<section>`.
 */

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
