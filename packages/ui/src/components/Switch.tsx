import styles from './Switch.module.css';
import { toggleReducer, toggleSemantics } from '@ilovecode33/ui-core';

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { Deformable } from './Deformable';

// px the pointer must travel before the press becomes a drag, and the knob's
// full left-to-right travel inside the track.
const DRAG_START = 4;
const KNOB_TRAVEL = 20;

/**
 * Toggle switch with `aria-checked` synced to the controlled `checked` prop.
 * Clicking calls `onChange` with the toggled value. Dragging the knob follows
 * the pointer (with `Deformable` supplying stretch/squash feedback) and commits
 * the side the knob ends on when released; a sub-threshold press stays a click.
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
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    moved: boolean;
    base: number;
  } | null>(null);
  const detachRef = useRef<(() => void) | null>(null);

  const detachDrag = () => {
    detachRef.current?.();
    detachRef.current = null;
  };

  useEffect(() => () => detachDrag(), []);

  /** Blocks the synthetic click that follows a drag, without touching later taps. */
  const blockNextClick = () => {
    const block = (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
    };
    document.addEventListener('click', block, { capture: true, once: true });
    window.setTimeout(
      () => document.removeEventListener('click', block, { capture: true }),
      0,
    );
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    detachDrag();
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      moved: false,
      base,
    };

    const onMove = (moveEvent: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag || moveEvent.pointerId !== drag.pointerId) return;
      const raw = moveEvent.clientX - drag.startX;
      if (!drag.moved && Math.abs(raw) >= DRAG_START) drag.moved = true;
      if (drag.moved) setDragRaw(raw);
    };

    const onUp = (upEvent: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag || upEvent.pointerId !== drag.pointerId) return;
      dragRef.current = null;
      detachDrag();
      if (!drag.moved || upEvent.type !== 'pointerup') {
        setDragRaw(null);
        return;
      }
      const raw = upEvent.clientX - drag.startX;
      const clamped = Math.min(Math.max(raw, -drag.base), KNOB_TRAVEL - drag.base);
      const next = drag.base + clamped > KNOB_TRAVEL / 2;
      setDragRaw(null);
      blockNextClick();
      if (next !== checked) onChange(next);
    };

    document.addEventListener('pointermove', onMove, true);
    document.addEventListener('pointerup', onUp, true);
    document.addEventListener('pointercancel', onUp, true);
    detachRef.current = () => {
      document.removeEventListener('pointermove', onMove, true);
      document.removeEventListener('pointerup', onUp, true);
      document.removeEventListener('pointercancel', onUp, true);
    };
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
    <Deformable enabled={deform} touchAction="pan-y">
      <button
        type="button"
        role={semantics.role}
        aria-checked={semantics.checked}
        aria-label={semantics.label}
        className={[styles['ui-switch'], styles[previewOn ? 'is-on' : ''] || ''].filter(Boolean).join(' ')}
        onPointerDown={onPointerDown}
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
