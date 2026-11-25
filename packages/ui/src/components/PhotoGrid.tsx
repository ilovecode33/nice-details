import classes from './PhotoGrid.module.css';
import { selectionModeReducer } from '@ilovecode33/ui-core';
import { useReducer, type CSSProperties, type ReactNode } from 'react';
import { Check } from 'lucide-react';
import { createCn } from '../css';
import { AspectImage } from './AspectImage';
import type { PhotoItem } from './Carousel';

const cn = createCn(classes);

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
    <div className={cn('ui-photogrid')} role="list" aria-label={label}>
      {items.map((item, index) => {
        const selected = selectedIds.includes(item.id);
        return (
          <div key={item.id} role="listitem" className={cn('ui-photogrid__cell')}>
            <button
              type="button"
              className={cn(`ui-photogrid__button ${selected ? 'is-selected' : ''}`)}
              aria-pressed={selectionMode ? selected : undefined}
              aria-label={`${selectionMode ? (selected ? 'Deselect ' : 'Select ') : 'Open '}${item.alt}`}
              onClick={() => (selectionMode ? onToggle?.(item.id) : onOpen?.(index))}
            >
              <AspectImage src={item.src} alt={item.alt} style={item.style}>
                {item.emoji}
              </AspectImage>
              {selectionMode && (
                <span className={cn('ui-photogrid__check')} aria-hidden="true">
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

export function useSelectionMode(initial: readonly string[] = []) {
  const [state, dispatch] = useReducer(selectionModeReducer, {
    active: false,
    selectedIds: initial,
  });
  return {
    active: state.active,
    selectedIds: state.selectedIds,
    toggle: (id: string) => dispatch({ type: 'toggle', id }),
    enter: () => dispatch({ type: 'enter' }),
    exit: () => dispatch({ type: 'exit' }),
    clear: () => dispatch({ type: 'clear' }),
  };
}
