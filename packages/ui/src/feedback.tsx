/**
 * Transient feedback components backed by the `FeedbackState` contract from
 * `@ilovecode33/ui-core`.
 */
import {
  feedbackReducer,
  feedbackSemantics,
  type FeedbackState,
  type FeedbackTone,
} from '@ilovecode33/ui-core';
import { type CSSProperties } from 'react';
import { Check, Info, X } from 'lucide-react';
import classes from './styles/feedback.module.css';
import { createCn } from './css';
const cn = createCn(classes);

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
    <div className={cn(`ui-banner is-${tone}`)} role={a11y.role}>
      <span className={cn('ui-banner__icon')} aria-hidden="true">
        {tone === 'success' ? <Check /> : tone === 'danger' ? <X /> : <Info />}
      </span>
      <span className={cn('ui-banner__message')}>{message}</span>
      {actionLabel && (
        <button type="button" className={cn('ui-banner__action')} onClick={onAction}>
          {actionLabel}
        </button>
      )}
      {onDismiss && (
        <button
          type="button"
          className={cn('ui-banner__dismiss')}
          aria-label={dismissLabel}
          onClick={onDismiss}
        >
          <X />
        </button>
      )}
    </div>
  );
}

/* ── ActivityIndicator / Skeleton / ProgressBar ──────────────────────────── */

export function ActivityIndicator({ label = 'Loading' }: { label?: string }) {
  return (
    <div className={cn('ui-spinner')} role="status" aria-label={label}>
      <span className={cn('ui-spinner__ring')} aria-hidden="true" />
    </div>
  );
}

export function Skeleton({
  width = '100%',
  height = '16px',
}: {
  width?: string;
  height?: string;
}) {
  return (
    <span
      className={cn('ui-skeleton')}
      aria-hidden="true"
      style={{ width, height } as CSSProperties}
    />
  );
}

export function ProgressBar({
  value,
  max = 100,
  label = 'Progress',
}: {
  value: number;
  max?: number;
  label?: string;
}) {
  const percent = max > 0 ? Math.min(Math.max((value / max) * 100, 0), 100) : 0;
  return (
    <div
      className={cn('ui-progressbar')}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
    >
      <div className={cn('ui-progressbar__track')}>
        <div className={cn('ui-progressbar__fill')} style={{ width: `${percent}%` }} />
      </div>
      <span className={cn('ui-progressbar__value')}>{Math.round(percent)}%</span>
    </div>
  );
}
