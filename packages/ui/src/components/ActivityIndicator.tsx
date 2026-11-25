import styles from './ActivityIndicator.module.css';

/**
 * Renders an indeterminate loading spinner for waits of unknown duration.
 * Uses `role="status"` with an accessible name while the visual ring is hidden from
 * assistive tech. `label` supplies that name and defaults to "Loading".
 */

export function ActivityIndicator({ label = 'Loading' }: { label?: string }) {
  return (
    <div className={styles['ui-spinner']} role="status" aria-label={label}>
      <span className={styles['ui-spinner__ring']} aria-hidden="true" />
    </div>
  );
}
