import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { useDeform } from './useDeform';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

/** Clamps a value to a closed range. */
const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));
const clampPercent = (value: number) => clamp(value, 0, 100);

function nearestSlotIndex(pointerX: number, slots: ReadonlyArray<SegmentPillSlot>): number {
  let nearest = 0;
  let distance = Infinity;
  slots.forEach((slot, index) => {
    const delta = Math.abs(slot.left + slot.width / 2 - pointerX);
    if (delta < distance) {
      distance = delta;
      nearest = index;
    }
  });
  return nearest;
}

// Drag feel constants. `SLOT_RADIUS` is the px band around a slot centre where
// the breakaway curve applies; `DEAD_ZONE_PX` is how far the pointer may move
// while the seated pill stays completely still; `BREAKAWAY_PX` is the band over
// which follow ramps from 0 to 1 after that dead zone; `MAGNET_STRENGTH` adds a
// light pull when entering the next slot. The ends are hard-clamped rather than
// rubber-banded: no excess is stored past the first/last slot, so releasing at
// an end has nothing to spring back from and cannot rebound.
const SLOT_RADIUS = 36;
const DEAD_ZONE_PX = 6;
const BREAKAWAY_PX = 36;
const MAGNET_STRENGTH = 0.25;
// Length of the post-release settle window; matches `--spring-dur` (0.22s).
// The curve is always `--ease` (no overshoot), never the spring easing.
const SETTLE_MS = 220;

export interface SegmentPillSlot {
  left: number;
  width: number;
  top?: number;
  height?: number;
}

/**
 * Tunable drag-feel constants. Defaults match a ~100px segmented slot; pass
 * smaller values for compact pill groups (e.g. icon-only controls) so the
 * snap/magnet zone does not swallow the whole slot.
 */
export interface SegmentPillFeel {
  /** px band around a slot centre where the breakaway/magnet curve applies. */
  slotRadius?: number;
  /** px the pointer may move before the seated pill starts following. */
  deadZone?: number;
  /** px band over which follow ramps from 0 to 1 after the dead zone. */
  breakaway?: number;
  /** 0–1 extra weight near a slot centre (1 = none at the radius edge). */
  magnetStrength?: number;
}

/**
 * Maps a raw pointer delta to a weighted pill offset (pure; all geometry is
 * passed in). The raw delta is hard-clamped to the first/last slot offsets —
 * no rubber band at the ends — so the pill never holds excess that could
 * animate back as a rebound on release. Inside the slot radius under the pointer
 * the pill uses a dead-zone breakaway: it does not move at all for the first
 * `deadZone` px, then follow ramps from 0 to 1 over another `breakaway` band
 * before it tracks the pointer 1:1. Between slots (`distance >= radius`) the
 * pill tracks the pointer smoothly at 1:1, and a light magnet adds weight
 * again when entering the next slot.
 */
export function weightedOffset(
  raw: number,
  pointerX: number,
  baseLeft: number,
  slots: ReadonlyArray<SegmentPillSlot>,
  feel: SegmentPillFeel = {},
): number {
  const slotRadius = Math.max(1, feel.slotRadius ?? SLOT_RADIUS);
  const deadZone = Math.max(0, feel.deadZone ?? DEAD_ZONE_PX);
  const breakawayBand = Math.max(1, feel.breakaway ?? BREAKAWAY_PX);
  const magnetStrength = Math.min(1, Math.max(0, feel.magnetStrength ?? MAGNET_STRENGTH));
  const first = slots[0].left - baseLeft;
  const last = slots[slots.length - 1].left - baseLeft;
  // Hard-clamp at the ends. With no stored excess past the endpoints the pill
  // stays seated there, and a release at an end has nothing to settle back from.
  if (raw <= first) return first;
  if (raw >= last) return last;

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
  const radius = Math.min(slotRadius, spacing / 2);
  // Smooth 1:1 tracking once the pointer has left the slot.
  if (distance >= radius) return raw;
  const target = nearest.left - baseLeft;
  const delta = raw - target;
  // Dead-zone breakaway: zero follow until the pointer clears the dead zone,
  // then a linear ramp to 1:1 over the remaining band. A light magnet (1 at
  // the radius edge, so the hand-off stays smooth) gives a little extra weight
  // as it enters the next slot.
  const breakaway = clamp((Math.abs(delta) - deadZone) / breakawayBand, 0, 1);
  const magnet = 1 - magnetStrength * (1 - distance / radius);
  const follow = breakaway * magnet;
  return target + delta * follow;
}

export interface UseSegmentPillDragOptions<T extends string> {
  /** Option values in render order. Keep this reference or at least its length stable. */
  values: readonly T[];
  /** Currently selected value; drives the settled seat. */
  value: T;
  /** Re-measures slot geometry when the track switches between layouts. */
  layoutKey?: unknown;
  /** Called once on release when the pointer's nearest slot differs. */
  onChange: (value: T) => void;
  /** Called immediately while dragging when the pointer crosses into a different slot. */
  onSlotChange?: (value: T, index: number) => void;
  /** Marks an index as non-draggable/non-selectable. */
  isDisabled?: (index: number) => boolean;
  /** Disables the elastic deform feedback (still allows selection). */
  deform?: boolean;
  /** Overrides the drag-feel constants (snap radius, dead zone, breakaway, magnet). */
  feel?: SegmentPillFeel;
}

/**
 * Shared pointer-drag engine for a sliding "pill" over a row of equal-or-mixed
 * width options. It measures each `[data-index]` item inside `trackRef`, tracks
 * the weighted drag offset on a dedicated inner shift layer, re-bases the
 * post-release settle against the new seat (so releasing at a boundary never
 * jumps or rebounds), and composes with `useDeform` for stretch/glow feedback.
 *
 * Render the returned refs/styles on three nested elements:
 * `trackRef` → outer scroll/layout row, `thumbRef` → absolutely positioned
 * seat, `shiftRef` → the visible pill carrying the drag offset.
 */
export function useSegmentPillDrag<T extends string>({
  values,
  value,
  layoutKey,
  onChange,
  onSlotChange,
  isDisabled,
  deform = true,
  feel,
}: UseSegmentPillDragOptions<T>) {
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const shiftRef = useRef<HTMLDivElement>(null);
  // `atEdge` records whether the latest move ran past an end slot and was
  // clamped, so release can skip the settle when the pill is already seated.
  const drag = useRef<{
    startX: number;
    baseLeft: number;
    atEdge: boolean;
    lastSlot: number;
  } | null>(null);
  // Render the pill only once measured, so it mounts at its final size
  // instead of transitioning in from zero on first paint.
  const [slots, setSlots] = useState<SegmentPillSlot[] | null>(null);
  const [dragOffset, setDragOffset] = useState<number | null>(null);
  // Post-release settle. `from` is the inner offset re-based against the new
  // seat so the pill stays exactly where the pointer left it; `run` starts the
  // transition one layout pass later, after that start value has been flushed.
  const [settle, setSettle] = useState<{ from: number; run: boolean } | null>(null);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Track which slot the pointer is over, not a boolean: after a click changes
  // the active slot, the indicator is still over the same spot and the pill
  // should light immediately without waiting for another pointer event.
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [glow, setGlow] = useState({ x: 50, y: 50, held: false });
  const reduced = usePrefersReducedMotion();
  const motion = useDeform({ enabled: deform, axis: 'x', touchAction: 'pan-y' });
  const activeIndex = Math.max(0, values.indexOf(value));
  const geometry = slots?.[activeIndex] ?? { left: 0, width: 0, top: 0, height: 0 };

  // Measure every slot, not just the active one: the pill needs the other
  // positions to snap on release, and options can have different widths.
  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const measure = () => {
      const buttons = [...track.querySelectorAll<HTMLElement>('[data-index]')];
      if (!buttons.length) return;
      const trackRect = track.getBoundingClientRect();
      const nextSlots = buttons.map((button) => {
        const rect = button.getBoundingClientRect();
        return {
          // The thumb is positioned in the track's scrollable content box.
          // Convert viewport coordinates back to that box so scrolling the
          // track does not leave the pill behind.
          left: rect.left - trackRect.left - track.clientLeft + track.scrollLeft,
          width: rect.width,
          top: rect.top - trackRect.top - track.clientTop + track.scrollTop,
          height: rect.height,
        };
      });
      setSlots((current) => {
        if (
          current?.length === nextSlots.length &&
          current.every(
            (slot, index) =>
              slot.left === nextSlots[index].left &&
              slot.width === nextSlots[index].width &&
              slot.top === nextSlots[index].top &&
              slot.height === nextSlots[index].height,
          )
        ) {
          return current;
        }
        return nextSlots;
      });
    };
    measure();
    track.addEventListener('scroll', measure, { passive: true });
    const observer =
      typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    observer?.observe(track);
    track
      .querySelectorAll<HTMLElement>('[data-index]')
      .forEach((button) => observer?.observe(button));
    return () => {
      observer?.disconnect();
      track.removeEventListener('scroll', measure);
    };
  }, [layoutKey, value, values.length]);

  const pressedIndex = (event: ReactPointerEvent<HTMLElement>) => {
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
    setSettle(null);
  };

  // The settle start value is committed with `transition: none`; force a style
  // flush, then flip to the spring transition and the 0 target. This lets the
  // browser interpolate instead of snapping when both land together.
  useLayoutEffect(() => {
    if (!settle || settle.run) return;
    void shiftRef.current?.getBoundingClientRect();
    setSettle({ from: 0, run: true });
  }, [settle]);

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
    // Only the selected pill is draggable. Pressing another slot must not
    // light up the pill; its native click simply slides the pill there.
    if (!deform || index !== activeIndex || isDisabled?.(index)) return;
    motion.handlers.onPointerDown(event);
    spark(relativeTo(shiftRef.current, event.clientX, event.clientY), true);
    drag.current = {
      startX: event.clientX,
      baseLeft: geometry.left,
      atEdge: false,
      lastSlot: activeIndex,
    };
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag.current || !slots?.length) return;
    motion.handlers.onPointerMove(event);
    const minLeft = slots[0].left;
    const maxLeft = slots[slots.length - 1].left;
    const raw = event.clientX - drag.current.startX;
    // Mirror the hard clamp at the ends: remember when the pointer ran past a
    // slot edge so release knows there is no excess to settle back from.
    drag.current.atEdge =
      raw <= minLeft - drag.current.baseLeft || raw >= maxLeft - drag.current.baseLeft;
    const pointerX =
      event.clientX -
      (trackRef.current?.getBoundingClientRect().left ?? 0) +
      (trackRef.current?.scrollLeft ?? 0);
    const nearest = nearestSlotIndex(pointerX, slots);
    if (nearest !== drag.current.lastSlot && !isDisabled?.(nearest)) {
      drag.current.lastSlot = nearest;
      onSlotChange?.(values[nearest], nearest);
    }
    const nextOffset = reduced
      ? clamp(raw, minLeft - drag.current.baseLeft, maxLeft - drag.current.baseLeft)
      : weightedOffset(
          raw,
          pointerX,
          drag.current.baseLeft,
          slots,
          feel,
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
    const { atEdge, baseLeft } = drag.current;
    motion.handlers.onPointerUp(event);
    // Snap to the slot under the released pointer, not the pill's centre —
    // that is where the user's finger actually is.
    const track = trackRef.current;
    const trackLeft = track?.getBoundingClientRect().left ?? 0;
    const pointerX =
      event.type === 'pointercancel'
        ? baseLeft + (dragOffset ?? 0) + geometry.width / 2
        : event.clientX - trackLeft + (track?.scrollLeft ?? 0);
    const nearest = slots?.length ? nearestSlotIndex(pointerX, slots) : 0;
    let selectionChanged = false;
    if (!isDisabled?.(nearest) && values[nearest] !== value) {
      onChange(values[nearest]);
      selectionChanged = true;
    }
    // The pill snapped under the pointer; keep it highlighted on release.
    if (event.type === 'pointerup') setHoveredIndex(nearest);
    drag.current = null;
    setDragOffset(null);
    setGlow((current) => ({ ...current, held: false }));
    cancelSettle();
    // A tap never moved the pill, so it has nothing to settle. An end-clamped
    // drag that kept the same selection is already seated and skips too.
    if (reduced || dragOffset === null || (atEdge && !selectionChanged)) return;
    // Re-base the settle start against the new seat. The outer `left` snaps to
    // the target slot in the same paint, so without this the stale drag offset
    // would be added on top and the pill would jump away and slide back — the
    // rebound seen at the last slot. `baseLeft + dragOffset` is the pill's
    // current visual left; subtracting the target keeps it exactly in place.
    const targetLeft = selectionChanged
      ? (slots?.[nearest]?.left ?? geometry.left)
      : geometry.left;
    const from = baseLeft + dragOffset - targetLeft;
    // The inner shift animates from `from` to 0 with `--ease` (no overshoot).
    // A new interaction cancels the timer.
    setSettle({ from, run: false });
    settleTimer.current = setTimeout(() => {
      settleTimer.current = null;
      setSettle(null);
    }, SETTLE_MS);
  };

  const dragging = dragOffset !== null;
  const settling = settle !== null;
  // During a drag the inner layer cancels useDeform's translate; during a settle
  // it starts from the re-based `from` and animates to 0.
  const shift = dragging
    ? (dragOffset ?? 0) - (motion.state.dx || 0)
    : (settle?.from ?? 0);
  const thumbStyle = {
    ...motion.style,
    left: geometry.left,
    width: geometry.width,
    // The outer seat only animates when idle. During a drag and during settle it
    // snaps to the slot, so the inner layer owns the whole visual movement and
    // the two never double-animate into an overshoot.
    transition: motion.state.active || reduced || settling
      ? 'none'
      : `left var(--dur) var(--ease), width var(--dur) var(--ease), transform var(--dur) var(--ease)`,
  } as CSSProperties;
  const shiftStyle = {
    transform: `translate3d(${shift}px, 0, 0)`,
    // The transition exists only on the second settle pass (`run`). The first
    // pass paints the re-based start with `transition: none`, then the layout
    // effect flips this on so the browser interpolates instead of snapping.
    transition:
      settle?.run && !reduced ? 'transform var(--spring-dur) var(--ease)' : 'none',
  } as CSSProperties;

  return {
    trackRef,
    thumbRef,
    shiftRef,
    slots,
    geometry,
    activeIndex,
    dragging,
    settling,
    hoveredIndex,
    setHoveredIndex,
    glow,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: onEnd,
      onPointerCancel: onEnd,
    },
    thumbStyle,
    shiftStyle,
  };
}
