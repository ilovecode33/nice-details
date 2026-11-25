import styles from './SliderRow.module.css';

/**
 * Labelled native range input with a live formatted value output.
 * Fully controlled through `value`/`onChange`; `label` and `fmt` are supplied
 * by props (there is no default label).
 */
export function SliderRow({
  label,
  min,
  max,
  step,
  value,
  fmt,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  fmt: (v: number) => string;
  onChange: (v: number) => void;
}) {
  return (
    <label className={styles['ui-slider']}>
      <span className={styles['ui-slider__top']}>
        <span className={styles['ui-slider__label']}>{label}</span>
        <output className={styles['ui-slider__value']}>{fmt(value)}</output>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}
