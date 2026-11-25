import classes from './AlertDialog.module.css';
import { sheetSemantics } from '@ilovecode33/ui-core';
import { useEffect, useRef, type ReactNode } from 'react';
import { createCn } from '../css';

const cn = createCn(classes);

/**
 * Modal overlays backed by the `SheetState` contract from
 * `@ilovecode33/ui-core`.
 */
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

export function AlertDialog({
  open,
  onClose,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
}) {
  useEscape(open, onClose);
  if (!open) return null;
  const semantics = sheetSemantics({ presented: true }, title);
  return (
    <div className={cn('ui-sheet')} role={semantics.role} aria-modal={semantics.modal} aria-label={semantics.label}>
      <div className={cn('ui-sheet__scrim')} onClick={onClose} />
      <div className={cn('ui-sheet__panel ui-alertdialog__panel')}>
        <header className={cn('ui-sheet__head')}>
          <h2>{title}</h2>
        </header>
        <div className={cn('ui-alertdialog__body')}>{message}</div>
        <div className={cn('ui-row ui-alertdialog__actions')}>
          <button type="button" className={cn('ui-btn ui-btn--secondary')} onClick={onClose}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={cn(`ui-btn ${destructive ? 'ui-btn--destructive' : 'ui-btn--primary'}`)}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
