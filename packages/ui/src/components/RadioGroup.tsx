import type { RadioOption } from '@ilovecode33/ui-types';
import styles from './RadioGroup.module.css';
import { radioSemantics } from '@ilovecode33/ui-core';

/**
 * Controlled radio group: `value` and `onChange` come from the caller, with
 * only the checked option in the tab order. Arrow Up/Down wrap through the
 * options and call `onChange`. Option labels, including the group `label`, are
 * caller-supplied; no English defaults are built in.
 */

export function RadioGroup<T extends string = string>({
  options,
  value,
  onChange,
  label,
}: {
  options: Array<RadioOption<T>>;
  value: T;
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <div className={styles['ui-radio']} role="radiogroup" aria-label={label}>
      {options.map((option) => {
        const checked = option.value === value;
        const semantics = radioSemantics(checked, option.label);
        return (
          <button
            key={option.value}
            type="button"
            role={semantics.role}
            aria-checked={semantics.checked}
            aria-label={semantics.label}
            tabIndex={checked ? 0 : -1}
            className={[styles['ui-radio__option'], styles[checked ? 'is-checked' : ''] || ''].filter(Boolean).join(' ')}
            onClick={() => onChange(option.value)}
            onKeyDown={(event) => {
              if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
              event.preventDefault();
              const index = options.findIndex((item) => item.value === value);
              const delta = event.key === 'ArrowDown' ? 1 : -1;
              const next = options[(index + delta + options.length) % options.length];
              if (next) onChange(next.value);
            }}
          >
            <span className={styles['ui-radio__dot']} aria-hidden="true" />
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
