import styles from './Deformable.module.css';

import type { DeformAxis, DeformState } from '@ilovecode33/ui-types';
import { useEffect, type CSSProperties, type HTMLAttributes } from 'react';
import { PressGlow } from './PressGlow';
import { useDeform } from '../hooks/useDeform';

/**
 * Wraps children in a div with drag-driven deformation and a press glow.
 * Pointer handling comes from `useDeform` and overrides conflicting props in `rest`;
 * caller `style` overrides the generated transform. When supplied, `onDragStateChange`
 * is called in an effect on each deformation state change.
 */
export function Deformable({
  children,
  className = '',
  max,
  axis,
  enabled,
  touchAction,
  onDragStateChange,
  style,
  ...rest
}: HTMLAttributes<HTMLDivElement> & {
  max?: number;
  axis?: DeformAxis;
  enabled?: boolean;
  touchAction?: CSSProperties['touchAction'];
  onDragStateChange?: (state: DeformState) => void;
}) {
  const deform = useDeform({ max, axis, enabled, touchAction });
  useEffect(() => {
    onDragStateChange?.(deform.state);
  }, [deform.state, onDragStateChange]);
  return (
    <div
      className={[styles['ui-deform'], className].filter(Boolean).join(' ')}
      style={{ ...deform.style, ...style }}
      {...rest}
      {...deform.handlers}
    >
      <PressGlow pulse={deform.pulse} />
      {children}
    </div>
  );
}
