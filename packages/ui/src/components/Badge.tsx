import styles from './Badge.module.css';

import { type ReactNode } from 'react';

/**
 * Renders a small inline badge for status or categorization.
 * `tone` selects one of four visual variants and defaults to "neutral"; all content
 * comes from `children`, so the component builds in no user-facing text.
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
