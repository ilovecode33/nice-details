import classes from './ActionSheet.module.css';
import { sheetSemantics } from '@ilovecode33/ui-core';
import { useEffect, useRef, type ReactNode } from 'react';
import { createCn } from '../css';

const cn = createCn(classes);

/**
 * Modal overlays backed by the `SheetState` contract from
 * `@ilovecode33/ui-core`.
 */
/* ── ActionSheet / AlertDialog ────────────────────────────────────────────── */

export interface ActionItem {
  label: string;
  onSelect: () => void;
  destructive?: boolean;
}

function useEscape(active: boolean, onClose: () => void) {
  useEffect(() => {
    if (!active) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [active, onClose]);
}

export function ActionSheet({
  open,
  onClose,
  title,
  actions,
  cancelLabel = 'Cancel',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  actions: ActionItem[];
  cancelLabel?: string;
}) {
  useEscape(open, onClose);
  if (!open) return null;
  const semantics = sheetSemantics({ presented: true }, title);
  return (
    <div className={cn('ui-sheet')} role={semantics.role} aria-modal={semantics.modal} aria-label={semantics.label}>
      <div className={cn('ui-sheet__scrim')} onClick={onClose} />
      <div className={cn('ui-sheet__panel')}>
        <div className={cn('ui-sheet__grabber')} aria-hidden="true" />
        <header className={cn('ui-sheet__head')}>
          <h2>{title}</h2>
        </header>
        <div className={cn('ui-actionsheet__list')}>
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              className={cn(`ui-actionsheet__action ${action.destructive ? 'is-destructive' : ''}`)}
              onClick={() => {
                action.onSelect();
                onClose();
              }}
            >
              {action.label}
            </button>
          ))}
          <button type="button" className={cn('ui-actionsheet__cancel')} onClick={onClose}>
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
