import styles from './PressGlow.module.css';

/**
 * Dedicated elastic-drag component and hook. Resistance, stretch, squash and
 * rotation come from `@ilovecode33/ui-tokens`; the nonlinear rubber-band state
 * comes from `@ilovecode33/ui-core`. No decorative animation — this is direct
 * manipulation feedback and is disabled under reduced motion.
 */

/**
 * Decorative bloom layer for an element using `useDeform().style`. `pulse`
 * remounts the layer per press; `held` keeps it visible until release. It is
 * aria-hidden, never focusable, and returns null when `pulse` is zero.
 */
export function PressGlow({ pulse, held = false }: { pulse: number; held?: boolean }) {
  if (pulse === 0) return null;
  return (
    <span key={pulse} className={[styles['ui-glow'], styles[held ? 'is-held' : ''] || ''].filter(Boolean).join(' ')} aria-hidden="true" />
  );
}
