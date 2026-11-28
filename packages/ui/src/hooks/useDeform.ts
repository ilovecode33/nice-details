import {
  createGestureMachine,
  deformReducer,
  type GestureContext,
  type GestureEvent,
} from '@ilovecode33/ui-core';
import type {
  DeformOptions,
  DeformResult,
  DeformState,
  GesturePhase,
  GestureSnapshot,
} from '@ilovecode33/ui-types';
import { MOTION } from '@ilovecode33/ui-tokens';
import {
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

const num = (value: string) => Number.parseFloat(value);
const DEFAULT_MAX = num(MOTION.deformShift);
const STRETCH = num(MOTION.deformStretch);
const SQUASH = num(MOTION.deformSquash);
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
 * disables feedback, `touchAction` overrides the axis-derived default, and
 * `longPressMs` delays touch gestures so page swipes still scroll.
 *
 * Press bookkeeping lives in `createGestureMachine`; this hook maps its phases
 * to deform feedback, pointer capture, scroll blocking, and click suppression,
 * and reports each snapshot through `onGesture`.
 *
 * @example
 * ```tsx
 * const motion = useDeform({ axis: 'x', touchAction: 'pan-y' });
 * return <button {...motion.handlers} style={motion.style}>Drag me</button>;
 * ```
 */
export function useDeform({
  max = DEFAULT_MAX,
  axis = 'both',
  enabled = true,
  touchAction,
  longPressMs = 0,
  onGesture,
}: DeformOptions = {}): DeformResult {
  const [state, dispatch] = useReducer(deformReducer, undefined, initialState);
  const [glow, setGlow] = useState({ x: 50, y: 50, pulse: 0 });
  const machine = useMemo(() => createGestureMachine(), []);
  const gesture = useRef<{ phase: GesturePhase; context: GestureContext }>({
    phase: machine.initial,
    context: machine.createContext(),
  });
  const element = useRef<HTMLElement | null>(null);
  const pointerType = useRef('');
  const size = useRef({ width: 0, height: 0 });
  const captured = useRef<number | null>(null);
  const cleanupTouch = useRef<(() => void) | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onGestureRef = useRef(onGesture);
  const reduced = usePrefersReducedMotion();
  // `enabled` and reduced motion only silence the visuals; press tracking still
  // runs so consumers such as a Select or Switch keep their drag behavior.
  const feedback = enabled && !reduced;

  onGestureRef.current = onGesture;

  const clearLongPress = () => {
    if (longPressTimer.current !== null) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const stopTouchGuard = () => {
    cleanupTouch.current?.();
    cleanupTouch.current = null;
  };

  const releaseCapture = () => {
    const node = element.current;
    if (node && captured.current !== null) {
      try {
        node.releasePointerCapture?.(captured.current);
      } catch {
        /* already released */
      }
    }
    captured.current = null;
  };

  useEffect(
    () => () => {
      clearLongPress();
      stopTouchGuard();
      releaseCapture();
    },
    [],
  );

  const startTouchGuard = () => {
    const node = element.current;
    if (!node || pointerType.current !== 'touch') return;
    stopTouchGuard();
    const preventScroll = (touchEvent: TouchEvent) => {
      const phase = gesture.current.phase;
      if (phase === 'armed' || phase === 'dragging') touchEvent.preventDefault();
    };
    node.addEventListener('touchmove', preventScroll, { passive: false });
    cleanupTouch.current = () =>
      node.removeEventListener('touchmove', preventScroll);
  };

  /** Applies the side effects of a phase change exactly once. */
  const applyPhase = (previous: GesturePhase, next: GesturePhase) => {
    if (next === 'armed' && previous !== 'armed') {
      startTouchGuard();
      if (feedback) dispatch({ type: 'start' });
      return;
    }
    if (next === 'dragging' && previous !== 'dragging') {
      const node = element.current;
      const pointerId = gesture.current.context.pointerId;
      if (node && pointerId !== null) {
        try {
          node.setPointerCapture?.(pointerId);
          captured.current = pointerId;
        } catch {
          /* capture is best-effort */
        }
      }
      return;
    }
    if (next === 'idle' && previous !== 'idle') {
      clearLongPress();
      stopTouchGuard();
      releaseCapture();
      if (feedback) dispatch({ type: 'end' });
    }
  };

  const send = (event: GestureEvent) => {
    const previous = gesture.current;
    const next = machine.transition(previous.phase, previous.context, event);
    gesture.current = { phase: next.state, context: next.context };

    const origin =
      event.type === 'down'
        ? next.context.origin
        : previous.context.origin ?? next.context.origin;
    const point = 'point' in event ? event.point : next.context.point;
    const snapshot: GestureSnapshot = {
      phase: next.state,
      previous: previous.phase,
      pointerId: next.context.pointerId ?? previous.context.pointerId,
      origin,
      point,
      delta:
        origin && point
          ? { x: point.x - origin.x, y: point.y - origin.y }
          : { x: 0, y: 0 },
      committed: previous.phase === 'dragging' && event.type === 'up',
    };

    if (previous.phase !== next.state) applyPhase(previous.phase, next.state);
    onGestureRef.current?.(snapshot);
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    const node = event.currentTarget;
    element.current = node;
    pointerType.current = event.pointerType;

    const rect = node.getBoundingClientRect();
    size.current = { width: rect.width, height: rect.height };
    const width = rect.width || 1;
    const height = rect.height || 1;
    if (feedback) {
      setGlow((current) => ({
        x: clampPercent(((event.clientX - rect.left) / width) * 100),
        y: clampPercent(((event.clientY - rect.top) / height) * 100),
        pulse: current.pulse + 1,
      }));
    }

    send({
      type: 'down',
      pointerId: event.pointerId,
      point: { x: event.clientX, y: event.clientY },
      instant: event.pointerType !== 'touch' || longPressMs <= 0,
    });

    if (gesture.current.phase === 'pressing') {
      clearLongPress();
      longPressTimer.current = setTimeout(() => {
        longPressTimer.current = null;
        send({ type: 'hold' });
      }, longPressMs);
    }
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (gesture.current.phase === 'idle') return;
    const point = { x: event.clientX, y: event.clientY };
    send({ type: 'move', point });

    if (!feedback || gesture.current.phase !== 'dragging') return;
    const origin = gesture.current.context.origin;
    if (!origin) return;
    dispatch({
      type: 'move',
      dx: point.x - origin.x,
      dy: point.y - origin.y,
      max,
      axis,
    });
  };

  const suppressNextClick = () => {
    const block = (clickEvent: MouseEvent) => {
      clickEvent.preventDefault();
      clickEvent.stopPropagation();
    };
    document.addEventListener('click', block, { capture: true, once: true });
    window.setTimeout(
      () => document.removeEventListener('click', block, { capture: true }),
      0,
    );
  };

  const end = (event: ReactPointerEvent<HTMLElement>) => {
    if (gesture.current.phase === 'idle') return;
    const point = { x: event.clientX, y: event.clientY };
    const wasDragging = gesture.current.phase === 'dragging';
    const node = element.current;
    const hit = document.elementFromPoint?.(point.x, point.y);
    const outside = Boolean(node && hit && !node.contains(hit));

    send({ type: event.type === 'pointerup' ? 'up' : 'cancel', point });

    // A drag is not a click. Suppress the synthetic click that follows pointerup,
    // especially when the pointer ended outside the control.
    if (event.type === 'pointerup' && (wasDragging || outside)) {
      suppressNextClick();
    }
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
