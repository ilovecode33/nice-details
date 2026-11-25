import styles from './Switch.module.css';
import { toggleReducer, toggleSemantics } from '@ilovecode33/ui-core';

import { Deformable } from './Deformable';

/** Switch with a synced checked state. */
export function Switch({
  checked,
  onChange,
  label,
  deform = true,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  deform?: boolean;
}) {
  const semantics = toggleSemantics({ checked }, label);
  return (
    <Deformable enabled={deform} touchAction="pan-y">
      <button
        type="button"
        role={semantics.role}
        aria-checked={semantics.checked}
        aria-label={semantics.label}
        className={[styles['ui-switch'], styles[checked ? 'is-on' : ''] || ''].filter(Boolean).join(' ')}
        onClick={() => onChange(toggleReducer({ checked }, { type: 'toggle' }).checked)}
      >
        <span className={styles['ui-switch__knob']} />
      </button>
    </Deformable>
  );
}
