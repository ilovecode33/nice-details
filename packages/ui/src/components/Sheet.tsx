import buttonClasses from './Button.module.css';
import styles from './Sheet.module.css';
import { sheetSemantics } from '@ilovecode33/ui-core';
import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { X } from 'lucide-react';


/** Bottom sheet / centered dialog overlay. */

export function Sheet({
  open,
  onClose,
  title,
  children,
  style,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  style?: CSSProperties;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    restoreRef.current = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      restoreRef.current?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;
  const semantics = sheetSemantics({ presented: open }, typeof title === 'string' ? title : undefined);
  return (
    <div
      className={styles['ui-sheet']}
      role={semantics.role}
      aria-modal={semantics.modal}
      aria-label={semantics.label}
    >
      <div className={styles['ui-sheet__scrim']} onClick={onClose} />
      <div className={styles['ui-sheet__panel']} style={style}>
        <div className={styles['ui-sheet__grabber']} aria-hidden="true" />
        <header className={styles['ui-sheet__head']}>
          <h2>{title}</h2>
          <button
            ref={closeRef}
            type="button"
            className={[buttonClasses['ui-btn'], buttonClasses['ui-btn--plain'], buttonClasses['ui-btn--compact']].filter(Boolean).join(' ')}
            aria-label="Close"
            onClick={onClose}
          >
            <span className={buttonClasses['ui-btn__icon']} aria-hidden="true">
              <X />
            </span>
          </button>
        </header>
        <div className={styles['ui-sheet__body']}>{children}</div>
      </div>
    </div>
  );
}