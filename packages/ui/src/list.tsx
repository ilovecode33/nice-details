/** Disclosure and List components backed by `ui-core` contracts. */
import { disclosureReducer, disclosureSemantics, listSemantics } from '@ilovecode33/ui-core';
import { useId, useState, type ReactNode } from 'react';
import classes from './styles/list.module.css';
import { createCn } from './css';
const cn = createCn(classes);

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
