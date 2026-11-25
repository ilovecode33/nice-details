import styles from './Chip.module.css';
import { navigationSemantics, tabSemantics } from '@ilovecode33/ui-core';
import { type HTMLAttributes, type ReactNode } from 'react';


/**
 * Navigation components. State and semantics come from
 * `@ilovecode33/ui-core`; this file only maps them to markup and tokens.
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
