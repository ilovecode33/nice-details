import styles from './Segmented.module.css';
import { tabSemantics } from '@ilovecode33/ui-core';
import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import { useDeform } from '../hooks/useDeform';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';


/** iOS-style segmented control with a draggable selected pill. */

export interface SegmentOption<T extends string> {
  value: T;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const clampPercent = (value: number) => clamp(value, 0, 100);

/**
 * iOS-style segmented control. The selected pill is the drag surface: pressing
 * it gives press feedback, dragging moves it freely with the pointer, and
 * release snaps it to the nearest slot and selects that option. Pressing any
 * other slot only slides the pill there — no press feedback on the pill.
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
  const drag = useRef<{ startX: number; baseLeft: number } | null>(null);
  // Render the pill only once measured, so it mounts at its final size
  // instead of transitioning in from zero on first paint.
  const [slots, setSlots] = useState<Array<{ left: number; width: number }> | null>(null);
  const [dragOffset, setDragOffset] = useState<number | null>(null);
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

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    const index = pressedIndex(event);
    const option = options[index];
    // Only the selected pill is draggable. Pressing another slot must not
    // light up the pill; its native click simply slides the pill there.
    if (!deform || index !== activeIndex || !option || option.disabled) return;
    motion.handlers.onPointerDown(event);
    spark(relativeTo(event.target as HTMLElement, event.clientX, event.clientY), true);
    drag.current = { startX: event.clientX, baseLeft: geometry.left };
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag.current || !slots?.length) return;
    motion.handlers.onPointerMove(event);
    const minLeft = slots[0].left;
    const maxLeft = slots[slots.length - 1].left;
    setDragOffset(
      clamp(
        event.clientX - drag.current.startX,
        minLeft - drag.current.baseLeft,
        maxLeft - drag.current.baseLeft,
      ),
    );
    // The spotlight follows the finger inside the pill as it is dragged.
    const position = relativeTo(thumbRef.current, event.clientX, event.clientY);
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
  };

  const dragging = dragOffset !== null;
  // Lit only when the pointer sits on the selected slot. Derived at render, so
  // a click that moves the active slot under a stationary pointer lights at once.
  const hovered = hoveredIndex !== null && hoveredIndex === activeIndex;
  const thumbStyle = {
    ...motion.style,
    left: geometry.left + (dragOffset ?? 0),
    width: geometry.width,
    transition:
      dragging || motion.state.active || reduced
        ? 'none'
        : `left var(--dur) var(--ease), width var(--dur) var(--ease), transform var(--spring-dur) var(--spring-ease)`,
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
        <div ref={thumbRef} className={styles['ui-segmented__thumb']} style={thumbStyle}>
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