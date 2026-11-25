import styles from './List.module.css';
import { disclosureReducer, disclosureSemantics, listSemantics } from '@ilovecode33/ui-core';
import { useId, useState, type ReactNode } from 'react';
import { ListRow } from './ListRow';
import type { ListItem } from './ListRow';


/** Disclosure and List components backed by `ui-core` contracts. */
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
    <ul className={styles['ui-list']} role={semantics.role} aria-label={semantics.label}>
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