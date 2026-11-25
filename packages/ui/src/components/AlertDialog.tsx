import buttonClasses from './Button.module.css';
import rowClasses from './Row.module.css';
import sheetClasses from './Sheet.module.css';
import styles from './AlertDialog.module.css';
import { sheetSemantics } from '@ilovecode33/ui-core';
import { type ReactNode } from 'react';
import { useEscape } from '../hooks/useEscape';

/** Modal confirmation dialog built on the shared Sheet surface. */
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
    <div className={sheetClasses['ui-sheet']} role={semantics.role} aria-modal={semantics.modal} aria-label={semantics.label}>
      <div className={sheetClasses['ui-sheet__scrim']} onClick={onClose} />
      <div className={[sheetClasses['ui-sheet__panel'], styles['ui-alertdialog__panel']].filter(Boolean).join(' ')}>
        <header className={sheetClasses['ui-sheet__head']}>
          <h2>{title}</h2>
        </header>
        <div className={styles['ui-alertdialog__body']}>{message}</div>
        <div className={[rowClasses['ui-row'], styles['ui-alertdialog__actions']].filter(Boolean).join(' ')}>
          <button type="button" className={[buttonClasses['ui-btn'], buttonClasses['ui-btn--secondary']].filter(Boolean).join(' ')} onClick={onClose}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={[buttonClasses['ui-btn'], styles[destructive ? buttonClasses['ui-btn--destructive'] : buttonClasses['ui-btn--primary']] || ''].filter(Boolean).join(' ')}
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
