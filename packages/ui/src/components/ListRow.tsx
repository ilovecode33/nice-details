import type { ListItem } from '@ilovecode33/ui-types';
import styles from './ListRow.module.css';
import { disclosureReducer, disclosureSemantics, listSemantics } from '@ilovecode33/ui-core';
import { useId, useState, type ReactNode } from 'react';



/** Disclosure and List components backed by `ui-core` contracts. */
/* ── List / ListRow ───────────────────────────────────────────────────────── */

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
    <li className={styles['ui-list__item']}>
      <button
        type="button"
        className={[styles['ui-list__row'], styles[selected ? 'is-selected' : ''] || ''].filter(Boolean).join(' ')}
        aria-current={selected ? 'true' : undefined}
        aria-expanded={hasDisclosure ? expanded : undefined}
        aria-controls={hasDisclosure ? bodyId : undefined}
        onClick={() => {
          onSelect?.(item.id);
          if (hasDisclosure) onToggleExpanded?.(item.id);
        }}
      >
        {item.leading && (
          <span className={styles['ui-list__leading']} aria-hidden="true">
            {item.leading}
          </span>
        )}
        <span className={styles['ui-list__text']}>
          <span className={styles['ui-list__title']}>{item.title}</span>
          {item.subtitle && <span className={styles['ui-list__subtitle']}>{item.subtitle}</span>}
        </span>
        {item.trailing && <span className={styles['ui-list__trailing']}>{item.trailing}</span>}
        {hasDisclosure && (
          <span className={[styles['ui-list__chevron'], styles[expanded ? 'is-open' : ''] || ''].filter(Boolean).join(' ')} aria-hidden="true">
            ⌄
          </span>
        )}
      </button>
      {hasDisclosure && expanded && (
        <div id={bodyId} className={styles['ui-list__expanded']}>
          {item.expandedContent}
        </div>
      )}
    </li>
  );
}
