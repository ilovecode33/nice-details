import classes from './NavBar.module.css';
import { navigationSemantics, tabSemantics } from '@ilovecode33/ui-core';
import { type HTMLAttributes, type ReactNode } from 'react';
import { createCn } from '../css';

const cn = createCn(classes);

/**
 * Navigation components. State and semantics come from
 * `@ilovecode33/ui-core`; this file only maps them to markup and tokens.
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
    <header className={cn('ui-navbar')} role={semantics.role} aria-label={semantics.label}>
      <div className={cn('ui-navbar__row')}>
        {onBack && (
          <button type="button" className={cn('ui-navbar__back')} onClick={onBack}>
            <span aria-hidden="true">‹</span>
            <span className={cn('ui-sr-only')}>{backLabel}</span>
          </button>
        )}
        <div className={cn('ui-navbar__titles')}>
          <h2 className={cn('ui-navbar__title')}>{title}</h2>
          {subtitle && <p className={cn('ui-navbar__subtitle')}>{subtitle}</p>}
        </div>
        {actions && <div className={cn('ui-navbar__actions')}>{actions}</div>}
      </div>
    </header>
  );
}
