import classes from './Toast.module.css';
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
/* ── Toast ────────────────────────────────────────────────────────────────── */

export function Toast({
  tone = 'info',
  message,
  visible,
  actionLabel,
  onAction,
  onDismiss,
  dismissLabel = 'Dismiss',
}: {
  tone?: FeedbackTone;
  message: string;
  visible: boolean;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss?: () => void;
  dismissLabel?: string;
}) {
  if (!visible) return null;
  const semantics = feedbackSemantics(
    feedbackReducer(
      { tone, message, visible, actionLabel },
      { type: 'show', tone, message, actionLabel },
    ),
  );
  return (
    <div
      className={cn(`ui-toast is-${tone}`)}
      role={semantics.role}
      aria-live={tone === 'danger' ? 'assertive' : 'polite'}
    >
      <span className={cn('ui-toast__dot')} aria-hidden="true" />
      <span className={cn('ui-toast__message')}>{message}</span>
      {actionLabel && (
        <button type="button" className={cn('ui-toast__action')} onClick={onAction}>
          {actionLabel}
        </button>
      )}
      {onDismiss && (
        <button
          type="button"
          className={cn('ui-toast__dismiss')}
          aria-label={dismissLabel}
          onClick={onDismiss}
        >
          <X />
        </button>
      )}
    </div>
  );
}
