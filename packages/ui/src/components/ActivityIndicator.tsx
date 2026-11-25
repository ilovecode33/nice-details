import styles from './ActivityIndicator.module.css';
import {
  feedbackReducer,
  feedbackSemantics,
  type FeedbackState,
  type FeedbackTone,
} from '@ilovecode33/ui-core';
import { type CSSProperties } from 'react';
import { Check, Info, X } from 'lucide-react';


/**
 * Transient feedback components backed by the `FeedbackState` contract from
 * `@ilovecode33/ui-core`.
 */
/* ── ActivityIndicator / Skeleton / ProgressBar ──────────────────────────── */

export function ActivityIndicator({ label = 'Loading' }: { label?: string }) {
  return (
    <div className={styles['ui-spinner']} role="status" aria-label={label}>
      <span className={styles['ui-spinner__ring']} aria-hidden="true" />
    </div>
  );
}
