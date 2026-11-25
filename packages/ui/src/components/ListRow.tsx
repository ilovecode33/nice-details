import classes from './ListRow.module.css';
import { disclosureReducer, disclosureSemantics, listSemantics } from '@ilovecode33/ui-core';
import { useId, useState, type ReactNode } from 'react';
import { createCn } from '../css';

const cn = createCn(classes);

/** Disclosure and List components backed by `ui-core` contracts. */
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
