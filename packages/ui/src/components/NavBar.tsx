import styles from './NavBar.module.css';
import { navigationSemantics } from '@ilovecode33/ui-core';
import { type ReactNode } from 'react';

/**
 * Top navigation header rendering a title, optional subtitle, optional trailing
 * actions and a back button shown only when `onBack` is provided. `title` and
 * `subtitle` are React nodes; the back button's accessible name comes from
 * `backLabel`, which defaults to English.
 */

export function NavBar({
  title,
  subtitle,
  backLabel = 'Back',
  onBack,
  actions,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  backLabel?: string;
  onBack?: () => void;
  actions?: ReactNode;
}) {
  const semantics = navigationSemantics({ active: 'root' }, typeof title === 'string' ? title : undefined);
  return (
    <header className={styles['ui-navbar']} role={semantics.role} aria-label={semantics.label}>
      <div className={styles['ui-navbar__row']}>
        {onBack && (
          <button type="button" className={styles['ui-navbar__back']} onClick={onBack}>
            <span aria-hidden="true">‹</span>
            <span className={'ui-sr-only'}>{backLabel}</span>
          </button>
        )}
        <div className={styles['ui-navbar__titles']}>
          <h2 className={styles['ui-navbar__title']}>{title}</h2>
          {subtitle && <p className={styles['ui-navbar__subtitle']}>{subtitle}</p>}
        </div>
        {actions && <div className={styles['ui-navbar__actions']}>{actions}</div>}
      </div>
    </header>
  );
}
