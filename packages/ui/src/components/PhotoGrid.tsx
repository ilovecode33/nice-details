import styles from './PhotoGrid.module.css';
import { selectionModeReducer } from '@ilovecode33/ui-core';
import { useReducer, type CSSProperties, type ReactNode } from 'react';
import { Check } from 'lucide-react';
import { AspectImage } from './AspectImage';
import type { PhotoItem } from './Carousel';


/** Photo grid and its selection-mode state helper. */

export function PhotoGrid({
  items,
  selectedIds = [],
  selectionMode = false,
  onToggle,
  onOpen,
  label = 'Photos',
}: {
  items: PhotoItem[];
  selectedIds?: readonly string[];
  selectionMode?: boolean;
  onToggle?: (id: string) => void;
  onOpen?: (index: number) => void;
  label?: string;
}) {
  return (
    <div className={styles['ui-photogrid']} role="list" aria-label={label}>
      {items.map((item, index) => {
        const selected = selectedIds.includes(item.id);
        return (
          <div key={item.id} role="listitem" className={styles['ui-photogrid__cell']}>
            <button
              type="button"
              className={[styles['ui-photogrid__button'], styles[selected ? 'is-selected' : ''] || ''].filter(Boolean).join(' ')}
              aria-pressed={selectionMode ? selected : undefined}
              aria-label={`${selectionMode ? (selected ? 'Deselect ' : 'Select ') : 'Open '}${item.alt}`}
              onClick={() => (selectionMode ? onToggle?.(item.id) : onOpen?.(index))}
            >
              <AspectImage src={item.src} alt={item.alt} style={item.style}>
                {item.emoji}
              </AspectImage>
              {selectionMode && (
                <span className={styles['ui-photogrid__check']} aria-hidden="true">
                  {selected ? <Check /> : null}
                </span>
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
}

/* ── SelectionMode helper ─────────────────────────────────────────────────── */
