/** Bottom sheet / centered dialog overlay. */
import { sheetSemantics } from '@ilovecode33/ui-core';
import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { X } from 'lucide-react';
import buttonClasses from './styles/button.module.css';
import sheetClasses from './styles/sheet.module.css';
import { createCn } from './css';
const cn = createCn(buttonClasses, sheetClasses);

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
      className={cn('ui-sheet')}
      role={semantics.role}
      aria-modal={semantics.modal}
      aria-label={semantics.label}
    >
      <div className={cn('ui-sheet__scrim')} onClick={onClose} />
      <div className={cn('ui-sheet__panel')} style={style}>
        <div className={cn('ui-sheet__grabber')} aria-hidden="true" />
        <header className={cn('ui-sheet__head')}>
          <h2>{title}</h2>
          <button
            ref={closeRef}
            type="button"
            className={cn('ui-btn ui-btn--plain ui-btn--compact')}
            aria-label="Close"
            onClick={onClose}
          >
            <span className={cn('ui-btn__icon')} aria-hidden="true">
              <X />
            </span>
          </button>
        </header>
        <div className={cn('ui-sheet__body')}>{children}</div>
      </div>
    </div>
  );
}
