import styles from './Banner.module.css';
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
/* ── Banner ───────────────────────────────────────────────────────────────── */

export function Banner({
  tone = 'info',
  message,
  actionLabel,
  onAction,
  onDismiss,
  dismissLabel = 'Dismiss',
}: {
  tone?: FeedbackTone;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss?: () => void;
  dismissLabel?: string;
}) {
  const semantics: FeedbackState = { tone, message, visible: true, actionLabel };
  const a11y = feedbackSemantics(semantics);
  return (
    <div className={[styles['ui-banner'], styles[`is-${tone}`]].filter(Boolean).join(' ')} role={a11y.role}>
      <span className={styles['ui-banner__icon']} aria-hidden="true">
        {tone === 'success' ? <Check /> : tone === 'danger' ? <X /> : <Info />}
      </span>
      <span className={styles['ui-banner__message']}>{message}</span>
      {actionLabel && (
        <button type="button" className={styles['ui-banner__action']} onClick={onAction}>
          {actionLabel}
        </button>
      )}
      {onDismiss && (
        <button
          type="button"
          className={styles['ui-banner__dismiss']}
          aria-label={dismissLabel}
          onClick={onDismiss}
        >
          <X />
        </button>
      )}
    </div>
  );
}
