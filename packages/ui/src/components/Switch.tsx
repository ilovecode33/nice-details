import styles from './Switch.module.css';
import { toggleReducer, toggleSemantics } from '@ilovecode33/ui-core';

import { useState } from 'react';
import type { GestureSnapshot } from '@ilovecode33/ui-types';
import { Deformable } from './Deformable';
import { SWITCH_LONG_PRESS_MS } from '../press';

// The knob's full left-to-right travel inside the track.
const KNOB_TRAVEL = 20;

/**
 * Toggle switch with `aria-checked` synced to the controlled `checked` prop.
 * Clicking calls `onChange` with the toggled value. A touch drag arms only
 * after a long press, so swiping the page never flips the switch; dragging the
 * knob then follows the pointer (with `Deformable` supplying stretch/squash
 * feedback) and commits the side it ends on. Mouse drags stay immediate.
 * Press phases and click suppression come from the shared gesture machine.
 * `label` is supplied by props and used as the accessible name.
 */
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
  const base = checked ? KNOB_TRAVEL : 0;

  // Live pointer delta while dragging; null when settled. Kept in px so the
  // knob can follow the finger exactly and clamp at both ends of the track.
  const [dragRaw, setDragRaw] = useState<number | null>(null);

  const handleGesture = (snapshot: GestureSnapshot) => {
    if (snapshot.phase === 'dragging') {
      setDragRaw(snapshot.delta.x);
      return;
    }
    if (snapshot.phase !== 'idle') return;
    if (snapshot.previous === 'dragging' && snapshot.committed) {
      const clamped = Math.min(
        Math.max(snapshot.delta.x, -base),
        KNOB_TRAVEL - base,
      );
      const next = base + clamped > KNOB_TRAVEL / 2;
      if (next !== checked) onChange(next);
    }
    setDragRaw(null);
  };

  const dragging = dragRaw !== null;
  const clampedRaw = Math.min(Math.max(dragRaw ?? 0, -base), KNOB_TRAVEL - base);
  const knobTranslate = base + clampedRaw;
  // iOS-style liquid knob: stretch only while crossing the middle of the track.
  // A bell curve is 0 at both seats and peaks at the halfway point, so the knob
  // is a circle when it reaches either end.
  const travel = dragging ? Math.min(1, Math.abs(clampedRaw) / KNOB_TRAVEL) : 0;
  const stretch = Math.sin(Math.PI * travel) * 0.18;
  // Preview the destination side while dragging so the track colour follows the
  // knob; the committed `aria-checked` only changes on release.
  const previewOn = dragging ? knobTranslate > KNOB_TRAVEL / 2 : checked;

  return (
    <Deformable
      enabled={deform}
      touchAction="pan-y"
      longPressMs={SWITCH_LONG_PRESS_MS}
      onGesture={handleGesture}
    >
      <button
        type="button"
        role={semantics.role}
        aria-checked={semantics.checked}
        aria-label={semantics.label}
        className={[styles['ui-switch'], styles[previewOn ? 'is-on' : ''] || ''].filter(Boolean).join(' ')}
        onClick={() => onChange(toggleReducer({ checked }, { type: 'toggle' }).checked)}
      >
        <span
          className={styles['ui-switch__knob']}
          style={{
            transform: `translateX(${knobTranslate}px) scaleX(${1 + stretch})`,
            transition: dragging ? 'none' : undefined,
          }}
        />
      </button>
    </Deformable>
  );
}
