import styles from './Checkbox.module.css';
import { checkboxSemantics } from '@ilovecode33/ui-core';
import { Deformable } from './Deformable';

/**
 * Renders a controlled checkbox with field-state styling and a visible text label.
 * A button with `role="checkbox"` and synced `aria-checked` toggles `!checked` on click;
 * the control and its text share a `<label>`. `deform` adds press/drag feedback without
 * blocking vertical scrolling. The label text comes from `label`.
 */

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
