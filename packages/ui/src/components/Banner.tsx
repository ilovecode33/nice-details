import styles from './Banner.module.css';
import { feedbackSemantics } from '@ilovecode33/ui-core';
import type { FeedbackState, FeedbackTone } from '@ilovecode33/ui-types';

import { Check, Info, X } from 'lucide-react';

/** Inline message banner with a tone and an optional dismiss action. */

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
