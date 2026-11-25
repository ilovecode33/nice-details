import styles from './ProgressBar.module.css';

/**
 * Determinate progress bar exposing ARIA value semantics and a visible
 * percentage. `value` is clamped to 0–`max` for the fill width while the raw
 * `value` is reported to assistive tech; `max <= 0` renders an empty bar.
 * `label` is a prop with an English default.
 */
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
      className={styles['ui-progressbar']}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
    >
      <div className={styles['ui-progressbar__track']}>
        <div className={styles['ui-progressbar__fill']} style={{ width: `${percent}%` }} />
      </div>
      <span className={styles['ui-progressbar__value']}>{Math.round(percent)}%</span>
    </div>
  );
}
