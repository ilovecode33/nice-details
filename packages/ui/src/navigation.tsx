/**
 * Navigation and list components. State and semantics come from
 * `@ilovecode33/ui-core`; this file only maps them to markup and tokens.
 */

import {
  disclosureReducer,
  disclosureSemantics,
  listSemantics,
  navigationSemantics,
  tabSemantics,
} from '@ilovecode33/ui-core';
import { useId, useState, type HTMLAttributes, type ReactNode } from 'react';
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

/* ── Disclosure ───────────────────────────────────────────────────────────── */

export function Disclosure({
  title,
  children,
  defaultOpen = false,
  open,
  onOpenChange,
}: {
  title: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internal, setInternal] = useState(defaultOpen);
  const current = open ?? internal;
  const semantics = disclosureSemantics({ open: current });
  const bodyId = useId();

  const toggle = () => {
    const next = disclosureReducer({ open: current }, { type: 'toggle' }).open;
    if (open === undefined) setInternal(next);
    onOpenChange?.(next);
  };

  return (
    <div className={cn('ui-disclosure')}>
      <button
        type="button"
        className={cn('ui-disclosure__trigger')}
        aria-expanded={semantics.expanded}
        aria-controls={bodyId}
        onClick={toggle}
      >
        <span>{title}</span>
        <span className={cn(`ui-disclosure__chevron ${current ? 'is-open' : ''}`)} aria-hidden="true">
          ⌄
        </span>
      </button>
      {current && (
        <div id={bodyId} className={cn('ui-disclosure__body')}>
          {children}
        </div>
      )}
    </div>
  );
}

/* ── List / ListRow ───────────────────────────────────────────────────────── */

export interface ListItem<T extends string = string> {
  id: T;
  title: ReactNode;
  subtitle?: ReactNode;
  leading?: ReactNode;
  trailing?: ReactNode;
  expandedContent?: ReactNode;
}

export function ListRow<T extends string = string>({
  item,
  selected = false,
  expanded = false,
  onSelect,
  onToggleExpanded,
}: {
  item: ListItem<T>;
  selected?: boolean;
  expanded?: boolean;
  onSelect?: (id: T) => void;
  onToggleExpanded?: (id: T) => void;
}) {
  const bodyId = useId();
  const hasDisclosure = Boolean(item.expandedContent);
  return (
    <li className={cn('ui-list__item')}>
      <button
        type="button"
        className={cn(`ui-list__row ${selected ? 'is-selected' : ''}`)}
        aria-current={selected ? 'true' : undefined}
        aria-expanded={hasDisclosure ? expanded : undefined}
        aria-controls={hasDisclosure ? bodyId : undefined}
        onClick={() => {
          onSelect?.(item.id);
          if (hasDisclosure) onToggleExpanded?.(item.id);
        }}
      >
        {item.leading && (
          <span className={cn('ui-list__leading')} aria-hidden="true">
            {item.leading}
          </span>
        )}
        <span className={cn('ui-list__text')}>
          <span className={cn('ui-list__title')}>{item.title}</span>
          {item.subtitle && <span className={cn('ui-list__subtitle')}>{item.subtitle}</span>}
        </span>
        {item.trailing && <span className={cn('ui-list__trailing')}>{item.trailing}</span>}
        {hasDisclosure && (
          <span className={cn(`ui-list__chevron ${expanded ? 'is-open' : ''}`)} aria-hidden="true">
            ⌄
          </span>
        )}
      </button>
      {hasDisclosure && expanded && (
        <div id={bodyId} className={cn('ui-list__expanded')}>
          {item.expandedContent}
        </div>
      )}
    </li>
  );
}

export function List<T extends string = string>({
  items,
  selectedId,
  expandedIds = [],
  onSelect,
  onToggleExpanded,
  label,
}: {
  items: Array<ListItem<T>>;
  selectedId?: T;
  expandedIds?: readonly T[];
  onSelect?: (id: T) => void;
  onToggleExpanded?: (id: T) => void;
  label?: string;
}) {
  const semantics = listSemantics(
    { items: items.map((item) => item.id), selectedId, expandedIds },
    label,
  );
  return (
    <ul className={cn('ui-list')} role={semantics.role} aria-label={semantics.label}>
      {items.map((item) => (
        <ListRow
          key={item.id}
          item={item}
          selected={item.id === selectedId}
          expanded={expandedIds.includes(item.id)}
          onSelect={onSelect}
          onToggleExpanded={onToggleExpanded}
        />
      ))}
    </ul>
  );
}
