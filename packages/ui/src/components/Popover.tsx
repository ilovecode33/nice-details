import styles from './Popover.module.css';

import { useEffect, useRef, type ReactNode } from 'react';

/**
 * Small anchored dialog rendered only while `open`. A document-level pointer
 * listener closes it on outside presses and Escape also calls `onClose`; both
 * listeners are attached only while open. Visibility is fully controlled by
 * the caller, and `label` supplies its accessible name.
 */

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
    <div ref={wrapRef} className={styles['ui-popover']} role="dialog" aria-label={label}>
      {children}
    </div>
  );
}
