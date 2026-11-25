import styles from './Skeleton.module.css';
import { feedbackReducer, feedbackSemantics } from '@ilovecode33/ui-core';
import type { FeedbackState, FeedbackTone } from '@ilovecode33/ui-types';
import { type CSSProperties } from 'react';
import { Check, Info, X } from 'lucide-react';


/**
 * Transient feedback components backed by the `FeedbackState` contract from
 * `@ilovecode33/ui-core`.
 */
export function Skeleton({
  width = '100%',
  height = '16px',
}: {
  width?: string;
  height?: string;
}) {
  return (
    <span
      className={styles['ui-skeleton']}
      aria-hidden="true"
      style={{ width, height } as CSSProperties}
    />
  );
}
