import styles from './Toast.module.css';
import { feedbackReducer, feedbackSemantics } from '@ilovecode33/ui-core';
import type { FeedbackTone } from '@ilovecode33/ui-types';

import { X } from 'lucide-react';

/**
 * Conditionally rendered transient message with tone styling and optional
 * action/dismiss buttons. Renders nothing when `visible` is false; danger
 * messages are announced assertively. `message`, `actionLabel`, and
 * `dismissLabel` (default 'Dismiss') come from props.
 */
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
      className={[styles['ui-toast'], styles[`is-${tone}`]].filter(Boolean).join(' ')}
      role={semantics.role}
      aria-live={tone === 'danger' ? 'assertive' : 'polite'}
    >
      <span className={styles['ui-toast__dot']} aria-hidden="true" />
      <span className={styles['ui-toast__message']}>{message}</span>
      {actionLabel && (
        <button type="button" className={styles['ui-toast__action']} onClick={onAction}>
          {actionLabel}
        </button>
      )}
      {onDismiss && (
        <button
          type="button"
          className={styles['ui-toast__dismiss']}
          aria-label={dismissLabel}
          onClick={onDismiss}
        >
          <X />
        </button>
      )}
    </div>
  );
}
