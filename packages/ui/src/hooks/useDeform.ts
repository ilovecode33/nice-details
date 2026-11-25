import type { DeformOptions, DeformResult } from '@ilovecode33/ui-types';
import { deformReducer } from '@ilovecode33/ui-core';
import type { DeformState } from '@ilovecode33/ui-types';
import { MOTION } from '@ilovecode33/ui-tokens';
import { useReducer, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

const num = (value: string) => Number.parseFloat(value);
const DEFAULT_MAX = num(MOTION.deformShift);
const STRETCH = num(MOTION.deformStretch);
const SQUASH = num(MOTION.deformSquash);
const CLICK_THRESHOLD = 4;
const clampPercent = (value: number) => Math.min(100, Math.max(0, value));

/** Create the resting deform state: inactive, with zero offsets and intensities. */
function initialState(): DeformState {
  return {
    active: false, dx: 0, dy: 0, rawX: 0, rawY: 0,
    intensityX: 0, intensityY: 0, progress: 0,
  };
}

/**
 * Pointer-drag feedback returning handlers for the target, a transform/glow
 * style, the deform state, and a `pulse` counter incremented per press. `max`
 * is the px resistance limit, `axis` selects responsive directions, `enabled`
 * disables feedback, and `touchAction` overrides the axis-derived default.
 * Inactive under reduced motion; capture starts after a 4px move, and drags or
 * outside releases suppress the following click so nested controls still tap.
 */
export function useDeform({
  max = DEFAULT_MAX,
  axis = 'both',
  enabled = true,
  touchAction,
}: DeformOptions = {}): DeformResult {
  const [state, dispatch] = useReducer(deformReducer, undefined, initialState);
  const [glow, setGlow] = useState({ x: 50, y: 50, pulse: 0 });
  const origin = useRef<{ x: number; y: number } | null>(null);
  const size = useRef({ width: 0, height: 0 });
  const moved = useRef(false);
  const captured = useRef<number | null>(null);
  const cleanupTouch = useRef<(() => void) | null>(null);
  const reduced = usePrefersReducedMotion();
  const active = enabled && !reduced;

  const onPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    if (!active || (event.pointerType === 'mouse' && event.button !== 0)) return;
    origin.current = { x: event.clientX, y: event.clientY };
    const rect = event.currentTarget.getBoundingClientRect();
    size.current = { width: rect.width, height: rect.height };
    const width = rect.width || 1;
    const height = rect.height || 1;
    setGlow((current) => ({
      x: clampPercent(((event.clientX - rect.left) / width) * 100),
      y: clampPercent(((event.clientY - rect.top) / height) * 100),
      pulse: current.pulse + 1,
    }));
    moved.current = false;
    // Touch gestures must not be stolen by the page scroller mid-drag.
    if (event.pointerType === 'touch') {
      const element = event.currentTarget;
      const preventScroll = (touchEvent: TouchEvent) => {
        if (origin.current) touchEvent.preventDefault();
      };
      element.addEventListener('touchmove', preventScroll, { passive: false });
      cleanupTouch.current = () =>
        element.removeEventListener('touchmove', preventScroll);
    }
    // Do not capture on pointerdown: capture retargets the subsequent click to
    // this container, which would break onClick on nested controls (e.g. the
    // footer dock buttons). Capture only once a real drag starts.
    dispatch({ type: 'start' });
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (!origin.current) return;
    if (
      !moved.current &&
      (Math.abs(event.clientX - origin.current.x) > CLICK_THRESHOLD ||
        Math.abs(event.clientY - origin.current.y) > CLICK_THRESHOLD)
    ) {
      moved.current = true;
      try {
        event.currentTarget.setPointerCapture?.(event.pointerId);
        captured.current = event.pointerId;
      } catch {
        /* capture is best-effort */
      }
    }
    dispatch({
      type: 'move',
      dx: event.clientX - origin.current.x,
      dy: event.clientY - origin.current.y,
      max,
      axis,
    });
  };

  const end = (event: ReactPointerEvent<HTMLElement>) => {
    if (!origin.current) return;
    const element = event.currentTarget as HTMLElement;
    const hit = document.elementFromPoint(event.clientX, event.clientY);
    const outside = Boolean(hit && !element.contains(hit));

    // A drag is not a click. Suppress the synthetic click that follows pointerup,
    // especially when the pointer ended outside the control.
    if (moved.current || outside) {
      const block = (clickEvent: MouseEvent) => {
        clickEvent.preventDefault();
        clickEvent.stopPropagation();
      };
      document.addEventListener('click', block, { capture: true, once: true });
      window.setTimeout(
        () => document.removeEventListener('click', block, { capture: true }),
        0,
      );
    }

    origin.current = null;
    moved.current = false;
    cleanupTouch.current?.();
    cleanupTouch.current = null;
    if (captured.current !== null) {
      try {
        element.releasePointerCapture?.(captured.current);
      } catch {
        /* already released */
      }
      captured.current = null;
    }
    dispatch({ type: 'end' });
  };

  // Deformation is an absolute pixel amount, not a fraction of the element.
  // Convert px → scale using the size measured at drag start, so a 100px Button
  // and a 570px Segmented stretch by the same number of pixels.
  const width = size.current.width || 1;
  const height = size.current.height || 1;
  const stretchX = state.intensityX * STRETCH;
  const squashY = state.intensityX * SQUASH;
  const stretchY = state.intensityY * STRETCH;
  const squashX = state.intensityY * SQUASH;
  const scaleX = Math.max(0.5, 1 + (stretchX - squashX) / width);
  const scaleY = Math.max(0.5, 1 + (stretchY - squashY) / height);

  const resolvedTouchAction =
    touchAction ?? (axis === 'x' ? 'pan-y' : axis === 'y' ? 'pan-x' : 'none');
  // Only create a transform (and therefore a stacking context) while dragging.
  // At rest the element must stay in the normal flow so overlays such as a
  // Select menu can escape their wrapper and stack above sibling controls.
  // Anchor the stretch on the edge opposite the pull: dragging right grows
  // only the right side, so the left edge stays put (and vice versa).
  const originX = state.dx > 0 ? '0%' : state.dx < 0 ? '100%' : '50%';
  const originY = state.dy > 0 ? '0%' : state.dy < 0 ? '100%' : '50%';

  const motionStyle: CSSProperties = state.active
    ? {
        transform: `translate3d(${state.dx}px, ${state.dy}px, 0) scale(${scaleX}, ${scaleY})`,
        transformOrigin: `${originX} ${originY}`,
        transition: 'none',
        willChange: 'transform',
      }
    : {
        transformOrigin: '50% 50%',
        transition:
          'transform var(--spring-dur) var(--spring-ease), box-shadow var(--glow-dur) var(--glow-ease)',
      };
  const style = {
    ...motionStyle,
    touchAction: resolvedTouchAction,
    '--glow-x': `${glow.x}%`,
    '--glow-y': `${glow.y}%`,
  } as CSSProperties;

  return {
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: end,
      onPointerCancel: end,
    },
    style,
    state,
    pulse: glow.pulse,
  };
}

/**
 * Standalone elastic-drag surface. Wrap any content to give it rubber-band
 * resistance and directional deformation while dragged.
 */
