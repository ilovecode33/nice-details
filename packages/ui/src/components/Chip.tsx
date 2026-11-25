import styles from './Chip.module.css';

import { type ReactNode } from 'react';

/**
 * Renders a compact chip whose `selected` state is mirrored to `aria-pressed`.
 * The chip stays controlled by the caller and `onClick` is optional; `label` supplies
 * an optional accessible name. Visible content comes from `children`.
 */

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
