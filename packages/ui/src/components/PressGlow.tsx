import styles from './PressGlow.module.css';


/**
 * Dedicated elastic-drag component and hook. Resistance, stretch, squash and
 * rotation come from `@ilovecode33/ui-tokens`; the nonlinear rubber-band state
 * comes from `@ilovecode33/ui-core`. No decorative animation — this is direct
 * manipulation feedback and is disabled under reduced motion.
 */



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
    <span key={pulse} className={[styles['ui-glow'], styles[held ? 'is-held' : ''] || ''].filter(Boolean).join(' ')} aria-hidden="true" />
  );
}