import styles from './Stepper.module.css';

/** Numeric stepper with increment and decrement buttons. */

export function Stepper({
  value,
  onChange,
  min = 0,
  max = 99,
  step = 1,
  label,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label: string;
}) {
  const clamp = (n: number) => Math.min(Math.max(n, min), max);
  return (
    <div className={styles['ui-stepper']} role="group" aria-label={label}>
      <button
        type="button"
        className={styles['ui-stepper__button']}
        aria-label={`Decrease ${label}`}
        disabled={value <= min}
        onClick={() => onChange(clamp(value - step))}
      >
        −
      </button>
      <output className={styles['ui-stepper__value']} aria-live="polite">
        {value}
      </output>
      <button
        type="button"
        className={styles['ui-stepper__button']}
        aria-label={`Increase ${label}`}
        disabled={value >= max}
        onClick={() => onChange(clamp(value + step))}
      >
        ＋
      </button>
    </div>
  );
}
