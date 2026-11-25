import styles from './GlassSurface.module.css';

import { type CSSProperties, type HTMLAttributes } from 'react';

import { PressGlow } from './PressGlow';
import { useDeform } from '../hooks/useDeform';

/**
 * Glass material surface forwarding native `div` attributes and merging caller
 * styles with deformation styles. With `deform` enabled, press handlers and a
 * reduced-motion-aware glow are attached. Visible text comes only from
 * `children`; no labels are built in.
 */

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
