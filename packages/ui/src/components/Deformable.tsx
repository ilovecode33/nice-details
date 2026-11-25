import styles from './Deformable.module.css';
import { type DeformAxis, type DeformState } from '@ilovecode33/ui-core';
import { useEffect, type CSSProperties, type HTMLAttributes } from 'react';
import { PressGlow } from './PressGlow';
import { useDeform } from '../hooks/useDeform';

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
