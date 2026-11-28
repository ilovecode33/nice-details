import { useOkrI18n } from '../i18n';
import type { RealtimeStatus } from '../realtime';
import styles from './SyncStatus.module.css';

export interface SyncStatusProps {
  status: RealtimeStatus | 'idle';
  onOpen: () => void;
}

/** Compact traffic light that opens the Sync sheet. */
export function SyncStatus({ status, onOpen }: SyncStatusProps) {
  const { t } = useOkrI18n();
  const normalized = status === 'closed' ? 'idle' : status;
  const statusKey =
    normalized === 'connected'
      ? 'sync.status.connected'
      : normalized === 'connecting'
        ? 'sync.status.connecting'
        : normalized === 'reconnecting'
          ? 'sync.status.reconnecting'
          : normalized === 'failed'
            ? 'sync.status.failed'
            : 'sync.status.idle';
  const statusLabel = t(statusKey);
  const active = (name: string) =>
    [styles.light, styles[name], normalized === name ? styles.active : '']
      .filter(Boolean)
      .join(' ');

  return (
    <button
      type="button"
      className={styles.status}
      onClick={onOpen}
      aria-label={t('sync.status.aria', { status: statusLabel })}
      title={statusLabel}
    >
      <span className={styles.lights} aria-hidden="true">
        <span className={active('failed')} />
        <span
          className={[styles.light, styles.yellow, normalized === 'connecting' || normalized === 'reconnecting' ? styles.active : ''].filter(Boolean).join(' ')}
        />
        <span
          className={[styles.light, styles.green, normalized === 'connected' ? styles.active : ''].filter(Boolean).join(' ')}
        />
      </span>
      <span className={styles.label}>{t('sync.open')}</span>
    </button>
  );
}
