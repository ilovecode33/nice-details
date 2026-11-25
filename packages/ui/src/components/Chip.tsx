import styles from './Chip.module.css';

import { type ReactNode } from 'react';

/** Compact selectable chip. */

export function Chip({
  children,
  selected = false,
  onClick,
  label,
}: {
  children: ReactNode;
  selected?: boolean;
  onClick?: () => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      className={[styles['ui-chip'], styles[selected ? 'is-active' : ''] || ''].filter(Boolean).join(' ')}
      aria-pressed={selected}
      aria-label={label}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
