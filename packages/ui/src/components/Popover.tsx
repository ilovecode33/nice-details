import classes from './Popover.module.css';
import { sheetSemantics } from '@ilovecode33/ui-core';
import { useEffect, useRef, type ReactNode } from 'react';
import { createCn } from '../css';

const cn = createCn(classes);

/**
 * Modal overlays backed by the `SheetState` contract from
 * `@ilovecode33/ui-core`.
 */
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
