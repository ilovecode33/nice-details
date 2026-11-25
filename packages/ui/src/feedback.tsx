/**
 * Transient feedback and overlay components backed by `FeedbackState` and
 * `SheetState` contracts from `@ilovecode33/ui-core`.
 */

import {
  feedbackReducer,
  feedbackSemantics,
  sheetSemantics,
  type FeedbackState,
  type FeedbackTone,
} from '@ilovecode33/ui-core';
import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { Check, Info, X } from 'lucide-react';
import { cn } from './css';

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

/* ── ActionSheet / AlertDialog ────────────────────────────────────────────── */

export interface ActionItem {
  label: string;
  onSelect: () => void;
  destructive?: boolean;
}

function useEscape(active: boolean, onClose: () => void) {
  useEffect(() => {
    if (!active) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [active, onClose]);
}

export function ActionSheet({
  open,
  onClose,
  title,
  actions,
  cancelLabel = 'Cancel',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  actions: ActionItem[];
  cancelLabel?: string;
}) {
  useEscape(open, onClose);
  if (!open) return null;
  const semantics = sheetSemantics({ presented: true }, title);
  return (
    <div className={cn('ui-sheet')} role={semantics.role} aria-modal={semantics.modal} aria-label={semantics.label}>
      <div className={cn('ui-sheet__scrim')} onClick={onClose} />
      <div className={cn('ui-sheet__panel')}>
        <div className={cn('ui-sheet__grabber')} aria-hidden="true" />
        <header className={cn('ui-sheet__head')}>
          <h2>{title}</h2>
        </header>
        <div className={cn('ui-actionsheet__list')}>
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              className={cn(`ui-actionsheet__action ${action.destructive ? 'is-destructive' : ''}`)}
              onClick={() => {
                action.onSelect();
                onClose();
              }}
            >
              {action.label}
            </button>
          ))}
          <button type="button" className={cn('ui-actionsheet__cancel')} onClick={onClose}>
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function AlertDialog({
  open,
  onClose,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
}) {
  useEscape(open, onClose);
  if (!open) return null;
  const semantics = sheetSemantics({ presented: true }, title);
  return (
    <div className={cn('ui-sheet')} role={semantics.role} aria-modal={semantics.modal} aria-label={semantics.label}>
      <div className={cn('ui-sheet__scrim')} onClick={onClose} />
      <div className={cn('ui-sheet__panel ui-alertdialog__panel')}>
        <header className={cn('ui-sheet__head')}>
          <h2>{title}</h2>
        </header>
        <div className={cn('ui-alertdialog__body')}>{message}</div>
        <div className={cn('ui-row ui-alertdialog__actions')}>
          <button type="button" className={cn('ui-btn ui-btn--secondary')} onClick={onClose}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={cn(`ui-btn ${destructive ? 'ui-btn--destructive' : 'ui-btn--primary'}`)}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Popover ──────────────────────────────────────────────────────────────── */

export function Popover({
  open,
  onClose,
  label,
  children,
}: {
  open: boolean;
  onClose: () => void;
  label: string;
  children: ReactNode;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) onClose();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div ref={wrapRef} className={cn('ui-popover')} role="dialog" aria-label={label}>
      {children}
    </div>
  );
}
