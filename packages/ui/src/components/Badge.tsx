import styles from './Badge.module.css';
import { navigationSemantics, tabSemantics } from '@ilovecode33/ui-core';
import { type HTMLAttributes, type ReactNode } from 'react';


/**
 * Navigation components. State and semantics come from
 * `@ilovecode33/ui-core`; this file only maps them to markup and tokens.
 */

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'neutral' | 'accent' | 'success' | 'danger';
}) {
  return <span className={[styles['ui-badge'], styles[`is-${tone}`]].filter(Boolean).join(' ')}>{children}</span>;
}
