import styles from './ActivityIndicator.module.css';

/** Accessible loading spinner for indeterminate waits. */

export function ActivityIndicator({ label = 'Loading' }: { label?: string }) {
  return (
    <div className={styles['ui-spinner']} role="status" aria-label={label}>
      <span className={styles['ui-spinner__ring']} aria-hidden="true" />
    </div>
  );
}
