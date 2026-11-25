import styles from './GlassSurface.module.css';

import { type CSSProperties, type HTMLAttributes } from 'react';

import { PressGlow } from './PressGlow';
import { useDeform } from '../hooks/useDeform';

/** Glass material surface with optional directional press feedback. */

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
