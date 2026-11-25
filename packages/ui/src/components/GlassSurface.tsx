import styles from './GlassSurface.module.css';
import {
  floatingReducer,
  floatingSemantics,
  type FloatingState,
} from '@ilovecode33/ui-core';
import { useReducer, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { PressGlow } from './PressGlow';
import { useDeform } from './Deformable';


/**
 * Floating chrome primitives. Material values come from `@ilovecode33/ui-tokens`;
 * collapse state and semantics come from `@ilovecode33/ui-core`.
 *
 * These surfaces float above content instead of occupying layout space. The
 * host is responsible for reserving room (padding / scroll-padding) so content
 * is never covered.
 */


/* ── GlassSurface ─────────────────────────────────────────────────────────── */

export function GlassSurface({
  className = '',
  elevation = 'default',
  deform = false,
  style,
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement> & {
  elevation?: 'default' | 'raised';
  deform?: boolean;
}) {
  const motion = useDeform({ enabled: deform });
  return (
    <div
      className={[styles['ui-glass'], styles[`ui-glass--${elevation}`], className].filter(Boolean).join(' ')}
      style={{ ...motion.style, ...style } as CSSProperties}
      {...rest}
      {...(deform ? motion.handlers : {})}
    >
      {deform && <PressGlow pulse={motion.pulse} />}
      {children}
    </div>
  );
}