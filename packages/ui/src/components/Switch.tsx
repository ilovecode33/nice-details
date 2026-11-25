import classes from './Switch.module.css';
import { toggleReducer, toggleSemantics } from '@ilovecode33/ui-core';
import { type InputHTMLAttributes, type ReactNode } from 'react';
import { Deformable } from './Deformable';
import { createCn } from '../css';

const cn = createCn(classes);

/** Lightweight form controls: SliderRow, Switch, Field, TextInput. */
/* ── Switch ──────────────────────────────────────────────────────────────── */
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
        className={cn(`ui-switch ${checked ? 'is-on' : ''}`)}
        onClick={() => onChange(toggleReducer({ checked }, { type: 'toggle' }).checked)}
      >
        <span className={cn('ui-switch__knob')} />
      </button>
    </Deformable>
  );
}
