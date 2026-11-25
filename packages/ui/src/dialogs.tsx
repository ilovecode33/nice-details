/**
 * Modal overlays backed by the `SheetState` contract from
 * `@ilovecode33/ui-core`.
 */
import { sheetSemantics } from '@ilovecode33/ui-core';
import { useEffect, useRef, type ReactNode } from 'react';
import { cn } from './css';

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

/* ── Popover ──────────────────────────────────────────────────────────────── */

export function Popover({
  open,
  onClose,
  label,
  children,
}: {
  open: boolean;
  onClose: () => void;
  label: string;
  children: ReactNode;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) onClose();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div ref={wrapRef} className={cn('ui-popover')} role="dialog" aria-label={label}>
      {children}
    </div>
  );
}
