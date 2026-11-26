import type { SegmentOption } from '@ilovecode33/ui-types';
import styles from './Segmented.module.css';
import { resist, tabSemantics } from '@ilovecode33/ui-core';
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react';
import { useDeform } from '../hooks/useDeform';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

/**
 * Clamp helpers shared by pill geometry, drag offsets, and spotlight
 * percentages; `clampPercent` bounds a value to the 0-100 range.
 */

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const clampPercent = (value: number) => clamp(value, 0, 100);

// Drag feel constants. `SLOT_RADIUS` is the px band around a slot centre where
// the breakaway curve applies; `DEAD_ZONE_PX` is how far the pointer may move
// while the seated pill stays completely still; `BREAKAWAY_PX` is the band over
// which follow ramps from 0 to 1 after that dead zone; `MAGNET_STRENGTH` adds a
// light pull when entering the next slot; `RUBBER_BAND_MAX` caps how far the
// pill may drift past the end slots.
const SLOT_RADIUS = 36;
const DEAD_ZONE_PX = 6;
const BREAKAWAY_PX = 36;
const MAGNET_STRENGTH = 0.25;
const RUBBER_BAND_MAX = 24;
// Length of the post-release settle window; matches `--spring-dur` (0.22s).
// The curve is always `--ease` (no overshoot), never the spring easing.
const SETTLE_MS = 220;

/**
 * Maps a raw pointer delta to a weighted pill offset (pure; all geometry is
 * passed in). Past the first/last slot the excess is rubber-banded with
 * `resist` instead of hard-clamped. Inside the slot radius under the pointer
 * the pill uses a dead-zone breakaway: it does not move at all for the first
 * `DEAD_ZONE_PX`, then follow ramps from 0 to 1 over another `BREAKAWAY_PX`
 * before it tracks the pointer 1:1. Between slots (`distance >= radius`) the
 * pill tracks the pointer smoothly at 1:1, and a light magnet adds weight
 * again when entering the next slot. The radius is capped at half the slot
 * spacing for a clean hand-off between neighbouring slots. The result drives
 * the inner shift layer; the outer thumb keeps its slot `left` and `useDeform`
 * transform, so the rendered net is the seat plus this damped offset.
 */
function weightedOffset(
  raw: number,
  pointerX: number,
  baseLeft: number,
  slots: Array<{ left: number; width: number }>,
): number {
  const first = slots[0].left - baseLeft;
  const last = slots[slots.length - 1].left - baseLeft;
  if (raw < first) return first + resist(raw - first, RUBBER_BAND_MAX);
  if (raw > last) return last + resist(raw - last, RUBBER_BAND_MAX);

  let nearest = slots[0];
  let distance = Infinity;
  for (const slot of slots) {
    const delta = Math.abs(slot.left + slot.width / 2 - pointerX);
    if (delta < distance) {
      distance = delta;
      nearest = slot;
    }
  }
  const spacing =
    slots.length > 1
      ? Math.min(...slots.slice(1).map((slot, index) => slot.left - slots[index].left))
      : Infinity;
  const radius = Math.min(SLOT_RADIUS, spacing / 2);
  // Smooth 1:1 tracking once the pointer has left the slot.
  if (distance >= radius) return raw;
  const target = nearest.left - baseLeft;
  const delta = raw - target;
  // Dead-zone breakaway: zero follow until the pointer clears the dead zone,
  // then a linear ramp to 1:1 over the remaining band. A light magnet (1 at
  // the radius edge, so the hand-off stays smooth) gives a little extra weight
  // as it enters the next slot.
  const breakaway = clamp((Math.abs(delta) - DEAD_ZONE_PX) / BREAKAWAY_PX, 0, 1);
  const magnet = 1 - MAGNET_STRENGTH * (1 - distance / radius);
  const follow = breakaway * magnet;
  return target + delta * follow;
}

/**
 * iOS-style segmented control rendering a measured pill over option buttons.
 * Controlled through `value`/`onChange`; slot geometry is measured in a layout
 * effect so the pill mounts at its final size and snaps on drag release.
 * Only the selected pill is draggable; arrow/Home/End keys change selection.
 * Option labels and the optional `label` are supplied by props. The outer pill
 * keeps `useDeform`'s transform for scale/glow/elastic feedback and never moves
 * its `left` during a drag: a single inner shift layer carries the damped
 * offset minus the deform translate, so the rendered net is the seated slot
 * plus the damped offset. That inner layer also owns the settle animation with
 * `--ease` (no spring overshoot); the outer only slides on selection change.
 */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
  deform = true,
}: {
  options: SegmentOption<T>[];
  value: T;
  onChange: (v: T) => void;
  label?: string;
  deform?: boolean;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const shiftRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ startX: number; baseLeft: number } | null>(null);
  // Render the pill only once measured, so it mounts at its final size
  // instead of transitioning in from zero on first paint.
  const [slots, setSlots] = useState<Array<{ left: number; width: number }> | null>(null);
  const [dragOffset, setDragOffset] = useState<number | null>(null);
  // Short settle window after a drag release; the inner shift layer animates
  // back to 0 with `--spring-dur` and the ordinary `--ease` for this long.
  const [settling, setSettling] = useState(false);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Track which slot the pointer is over, not a boolean: after a click changes
  // the active slot, the indicator is still over the same spot and the pill
  // should light immediately without waiting for another pointer event.
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [glow, setGlow] = useState({ x: 50, y: 50, held: false });
  const reduced = usePrefersReducedMotion();
  const motion = useDeform({ enabled: deform, axis: 'x', touchAction: 'pan-y' });
  const activeIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );
  const geometry = slots?.[activeIndex] ?? { left: 0, width: 0 };

  // Measure every slot, not just the active one: the pill needs the other
  // positions to snap on release, and labels can have different widths.
  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const measure = () => {
      const buttons = [...track.querySelectorAll<HTMLElement>('[data-index]')];
      if (!buttons.length) return;
      const trackLeft = track.getBoundingClientRect().left;
      setSlots(
        buttons.map((button) => {
          const rect = button.getBoundingClientRect();
          return { left: rect.left - trackLeft, width: rect.width };
        }),
      );
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    track.querySelectorAll('button').forEach((button) => observer.observe(button));
    return () => observer.disconnect();
  }, [value, options]);

  const pressedIndex = (event: ReactPointerEvent<HTMLDivElement>) => {
    const hit = (event.target as HTMLElement).closest<HTMLElement>('[data-index]');
    return hit ? Number(hit.dataset.index) : -1;
  };

  /** Converts client coordinates into clamped 0-100 percentages inside `element`. */
  const relativeTo = (element: HTMLElement | null, x: number, y: number) => {
    if (!element) return { x: 50, y: 50 };
    const rect = element.getBoundingClientRect();
    return {
      x: clampPercent(((x - rect.left) / (rect.width || 1)) * 100),
      y: clampPercent(((y - rect.top) / (rect.height || 1)) * 100),
    };
  };

  const spark = (position = { x: 50, y: 50 }, held = true) =>
    setGlow((current) => ({ ...position, held }));

  /** Cancels a pending settle window so a new interaction starts from rest. */
  const cancelSettle = () => {
    if (settleTimer.current !== null) {
      clearTimeout(settleTimer.current);
      settleTimer.current = null;
    }
    setSettling(false);
  };

  useEffect(
    () => () => {
      if (settleTimer.current !== null) clearTimeout(settleTimer.current);
      drag.current = null;
    },
    [],
  );

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    cancelSettle();
    const index = pressedIndex(event);
    const option = options[index];
    // Only the selected pill is draggable. Pressing another slot must not
    // light up the pill; its native click simply slides the pill there.
    if (!deform || index !== activeIndex || !option || option.disabled) return;
    motion.handlers.onPointerDown(event);
    spark(relativeTo(shiftRef.current, event.clientX, event.clientY), true);
    drag.current = { startX: event.clientX, baseLeft: geometry.left };
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag.current || !slots?.length) return;
    motion.handlers.onPointerMove(event);
    const minLeft = slots[0].left;
    const maxLeft = slots[slots.length - 1].left;
    const raw = event.clientX - drag.current.startX;
    const nextOffset = reduced
      ? clamp(raw, minLeft - drag.current.baseLeft, maxLeft - drag.current.baseLeft)
      : weightedOffset(
          raw,
          event.clientX - (trackRef.current?.getBoundingClientRect().left ?? 0),
          drag.current.baseLeft,
          slots,
        );
    setDragOffset(nextOffset);
    // The spot lives on the inner shift layer, which will move by `nextShift`
    // on the upcoming render. Measure against the stable outer thumb and
    // subtract that pending shift first; measuring the inner rect now would
    // use its old position and paint the glow ahead of the finger.
    const nextShift = nextOffset - (motion.state.dx || 0);
    const position = relativeTo(thumbRef.current, event.clientX - nextShift, event.clientY);
    setGlow((current) => ({ ...current, ...position }));
  };

  const onEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    motion.handlers.onPointerUp(event);
    // Snap to the slot under the released pointer, not the pill's centre —
    // that is where the user's finger actually is.
    const trackLeft = trackRef.current?.getBoundingClientRect().left ?? 0;
    const pointerX =
      event.type === 'pointercancel'
        ? drag.current.baseLeft + (dragOffset ?? 0) + geometry.width / 2
        : event.clientX - trackLeft;
    let nearest = 0;
    let distance = Infinity;
    slots?.forEach((slot, index) => {
      const delta = Math.abs(slot.left + slot.width / 2 - pointerX);
      if (delta < distance) {
        distance = delta;
        nearest = index;
      }
    });
    const option = options[nearest];
    if (option && !option.disabled && option.value !== value) onChange(option.value);
    // The pill snapped under the pointer; keep it highlighted on release.
    if (event.type === 'pointerup') setHoveredIndex(nearest);
    drag.current = null;
    setDragOffset(null);
    setGlow((current) => ({ ...current, held: false }));
    cancelSettle();
    // A tap never moved the pill, so it has nothing to settle.
    if (reduced || dragOffset === null) return;
    // The inner shift animates from its damped offset to 0 over `--spring-dur`
    // with `--ease` (no overshoot). A new interaction cancels the timer.
    setSettling(true);
    settleTimer.current = setTimeout(() => {
      settleTimer.current = null;
      setSettling(false);
    }, SETTLE_MS);
  };

  const dragging = dragOffset !== null;
  // `useDeform` translates by `state.dx = resist(rawDeltaX, 18px)`. The inner
  // layer cancels exactly that translate so its own offset is the damped net;
  // the outer `left` stays at the seated slot for the whole drag.
  const shift = dragging ? (dragOffset ?? 0) - (motion.state.dx || 0) : 0;
  // Lit only when the pointer sits on the selected slot. Derived at render, so
  // a click that moves the active slot under a stationary pointer lights at once.
  const hovered = hoveredIndex !== null && hoveredIndex === activeIndex;
  const dataUi = dragging
    ? 'segmented__thumb segmented__thumb--dragging'
    : settling
      ? 'segmented__thumb segmented__thumb--settling'
      : 'segmented__thumb';
  const thumbStyle = {
    ...motion.style,
    left: geometry.left,
    width: geometry.width,
    transition:
      motion.state.active || reduced
        ? 'none'
        : `left var(--dur) var(--ease), width var(--dur) var(--ease), transform var(--dur) var(--ease)`,
  } as CSSProperties;
  const shiftStyle = {
    transform: `translate3d(${shift}px, 0, 0)`,
    transition:
      settling && !reduced ? 'transform var(--spring-dur) var(--ease)' : 'none',
  } as CSSProperties;

  return (
    <div
      ref={trackRef}
      className={styles['ui-segmented']}
      role="tablist"
      aria-label={label}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onEnd}
      onPointerCancel={onEnd}
    >
      {slots && (
        <div
          ref={thumbRef}
          className={styles['ui-segmented__thumb']}
          data-ui={dataUi}
          style={thumbStyle}
        >
          <div
            ref={shiftRef}
            className={styles['ui-segmented__thumb-shift']}
            data-ui="segmented__thumb-shift"
            style={shiftStyle}
          >
            <span
              className={[styles['ui-segmented__sheen'], styles[glow.held ? 'is-held' : ''] || '', styles[hovered ? 'is-hovered' : ''] || ''].filter(Boolean).join(' ')}
              aria-hidden="true"
            />
            <span
              className={[styles['ui-segmented__spot'], styles[glow.held ? 'is-held' : ''] || ''].filter(Boolean).join(' ')}
              style={
                {
                  '--seg-glow-x': `${glow.x}%`,
                  '--seg-glow-y': `${glow.y}%`,
                } as CSSProperties
              }
              aria-hidden="true"
            />
          </div>
        </div>
      )}
      {options.map((o, index) => {
        const semantics = tabSemantics(o, value);
        return (
          <button
            key={o.value}
            type="button"
            role={semantics.role}
            data-index={index}
            data-active={value === o.value}
            aria-selected={semantics.selected}
            aria-disabled={semantics.disabled || undefined}
            aria-label={semantics.label}
            tabIndex={o.value === value ? 0 : -1}
            className={[styles['ui-segmented__item'], styles[value === o.value ? 'is-active' : ''] || ''].filter(Boolean).join(' ')}
            onPointerEnter={() => setHoveredIndex(index)}
            onPointerLeave={() => setHoveredIndex(null)}
            onClick={() => {
              if (o.disabled) return;
              // Just slide the pill to the target. No press bloom: the hover
              // state already lights the pill the moment the pointer is over
              // the now-active slot, so there is no delayed highlight.
              onChange(o.value);
            }}
            onKeyDown={(event) => {
              const current = options.findIndex((item) => item.value === value);
              let next: number | undefined;
              if (event.key === 'ArrowRight') next = (current + 1) % options.length;
              if (event.key === 'ArrowLeft') next = (current - 1 + options.length) % options.length;
              if (event.key === 'Home') next = 0;
              if (event.key === 'End') next = options.length - 1;
              if (next === undefined) return;
              event.preventDefault();
              cancelSettle();
              const option = options[next];
              if (option && !option.disabled) onChange(option.value);
            }}
          >
            {o.icon && <span aria-hidden="true">{o.icon}</span>}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
