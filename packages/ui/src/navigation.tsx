/**
 * Navigation components. State and semantics come from
 * `@ilovecode33/ui-core`; this file only maps them to markup and tokens.
 */
import { navigationSemantics, tabSemantics } from '@ilovecode33/ui-core';
import { type HTMLAttributes, type ReactNode } from 'react';
import { cn } from './css';

/* ── Divider / Badge / Chip ───────────────────────────────────────────────── */

export function Divider({ className = '', ...rest }: HTMLAttributes<HTMLHRElement>) {
  return <hr className={cn(`ui-divider ${className}`)} {...rest} />;
}

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'neutral' | 'accent' | 'success' | 'danger';
}) {
  return <span className={cn(`ui-badge is-${tone}`)}>{children}</span>;
}

export function Chip({
  children,
  selected = false,
  onClick,
  label,
}: {
  children: ReactNode;
  selected?: boolean;
  onClick?: () => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      className={cn(`ui-chip ${selected ? 'is-active' : ''}`)}
      aria-pressed={selected}
      aria-label={label}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

/* ── NavBar ───────────────────────────────────────────────────────────────── */

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

/* ── TabBar ───────────────────────────────────────────────────────────────── */

export interface TabItem<T extends string = string> {
  value: T;
  label: ReactNode;
  icon?: ReactNode;
  badge?: ReactNode;
}

export function TabBar<T extends string = string>({
  items,
  value,
  onChange,
  label = 'Sections',
  variant = 'fixed',
}: {
  items: Array<TabItem<T>>;
  value: T;
  onChange: (value: T) => void;
  label?: string;
  variant?: 'inline' | 'fixed';
}) {
  const semantics = navigationSemantics({ active: value }, label);
  return (
    <nav
      className={cn(`ui-tabbar ui-tabbar--${variant}`)}
      aria-label={semantics.label}
    >
      <div className={cn('ui-tabbar__inner')} role="tablist">
        {items.map((item) => {
          const tab = tabSemantics({ value: item.value }, value);
          return (
            <button
              key={item.value}
              type="button"
              role={tab.role}
              aria-selected={tab.selected}
              tabIndex={tab.selected ? 0 : -1}
              className={cn(`ui-tabbar__item ${tab.selected ? 'is-active' : ''}`)}
              onClick={() => onChange(item.value)}
              onKeyDown={(event) => {
                const index = items.findIndex((candidate) => candidate.value === value);
                let next: number | undefined;
                if (event.key === 'ArrowRight') next = (index + 1) % items.length;
                if (event.key === 'ArrowLeft') next = (index - 1 + items.length) % items.length;
                if (event.key === 'Home') next = 0;
                if (event.key === 'End') next = items.length - 1;
                if (next === undefined) return;
                event.preventDefault();
                const candidate = items[next];
                if (candidate) onChange(candidate.value);
              }}
            >
              {item.icon && (
                <span className={cn('ui-tabbar__icon')} aria-hidden="true">
                  {item.icon}
                </span>
              )}
              <span className={cn('ui-tabbar__label')}>{item.label}</span>
              {item.badge && (
                <span className={cn('ui-tabbar__badge')} aria-hidden="true">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
