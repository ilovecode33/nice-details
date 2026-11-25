import classes from './ActivityIndicator.module.css';
import {
  feedbackReducer,
  feedbackSemantics,
  type FeedbackState,
  type FeedbackTone,
} from '@ilovecode33/ui-core';
import { type CSSProperties } from 'react';
import { Check, Info, X } from 'lucide-react';
import { createCn } from '../css';

const cn = createCn(classes);

/**
 * Transient feedback components backed by the `FeedbackState` contract from
 * `@ilovecode33/ui-core`.
 */
/* ── ActivityIndicator / Skeleton / ProgressBar ──────────────────────────── */

export function ActivityIndicator({ label = 'Loading' }: { label?: string }) {
  return (
    <div className={cn('ui-spinner')} role="status" aria-label={label}>
      <span className={cn('ui-spinner__ring')} aria-hidden="true" />
    </div>
  );
}
