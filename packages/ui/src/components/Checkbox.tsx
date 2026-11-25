import styles from './Checkbox.module.css';
import { checkboxSemantics } from '@ilovecode33/ui-core';
import { Deformable } from './Deformable';

/** Native checkbox with field-state styling. */

export function Checkbox({
  checked,
  onChange,
  label,
  deform = true,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  deform?: boolean;
}) {
  const semantics = checkboxSemantics(checked, label);
  return (
    <Deformable enabled={deform} touchAction="pan-y">
      <label className={styles['ui-checkbox']}>
        <button
          type="button"
          role={semantics.role}
          aria-checked={semantics.checked}
          aria-label={semantics.label}
          className={[styles['ui-checkbox__box'], styles[checked ? 'is-checked' : ''] || ''].filter(Boolean).join(' ')}
          onClick={() => onChange(!checked)}
        >
          {checked && <span aria-hidden="true">✓</span>}
        </button>
        <span>{label}</span>
      </label>
    </Deformable>
  );
}
