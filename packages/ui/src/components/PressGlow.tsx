import classes from './PressGlow.module.css';
import {
  deformReducer,
  type DeformAxis,
  type DeformState,
} from '@ilovecode33/ui-core';
import { MOTION } from '@ilovecode33/ui-tokens';
import {
  useEffect,
  useReducer,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import { createCn } from '../css';
import { useDeform } from './Deformable';

const cn = createCn(classes);

/**
 * Dedicated elastic-drag component and hook. Resistance, stretch, squash and
 * rotation come from `@ilovecode33/ui-tokens`; the nonlinear rubber-band state
 * comes from `@ilovecode33/ui-core`. No decorative animation — this is direct
 * manipulation feedback and is disabled under reduced motion.
 */


const num = (value: string) => Number.parseFloat(value);
const DEFAULT_MAX = num(MOTION.deformShift);
const STRETCH = num(MOTION.deformStretch);
const SQUASH = num(MOTION.deformSquash);
const CLICK_THRESHOLD = 4;
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduced(query.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);
  return reduced;
}
const clampPercent = (value: number) => Math.min(100, Math.max(0, value));

/**
 * A liquid-glass style bloom at the press point. Render it inside any element
 * whose `useDeform().style` is applied. `pulse` remounts the layer so each press
 * starts fresh; pass `held` from `useDeform().state.active` to keep the glow
 * alive for the whole press and fade it only on release. Hidden under reduced
 * motion and never focusable, so it adds no semantics or tab stop.
 */
export function PressGlow({ pulse, held = false }: { pulse: number; held?: boolean }) {
  if (pulse === 0) return null;
  return (
    <span key={pulse} className={cn(`ui-glow ${held ? 'is-held' : ''}`)} aria-hidden="true" />
  );
}
