import type { ActionItem } from '@ilovecode33/ui-types';
import sheetClasses from './Sheet.module.css';
import styles from './ActionSheet.module.css';
import { sheetSemantics } from '@ilovecode33/ui-core';

import { useEscape } from '../hooks/useEscape';

/** Bottom sheet that lists actions with an optional cancel button. */

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
    <div className={sheetClasses['ui-sheet']} role={semantics.role} aria-modal={semantics.modal} aria-label={semantics.label}>
      <div className={sheetClasses['ui-sheet__scrim']} onClick={onClose} />
      <div className={sheetClasses['ui-sheet__panel']}>
        <div className={sheetClasses['ui-sheet__grabber']} aria-hidden="true" />
        <header className={sheetClasses['ui-sheet__head']}>
          <h2>{title}</h2>
        </header>
        <div className={styles['ui-actionsheet__list']}>
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              className={[styles['ui-actionsheet__action'], styles[action.destructive ? 'is-destructive' : ''] || ''].filter(Boolean).join(' ')}
              onClick={() => {
                action.onSelect();
                onClose();
              }}
            >
              {action.label}
            </button>
          ))}
          <button type="button" className={styles['ui-actionsheet__cancel']} onClick={onClose}>
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
