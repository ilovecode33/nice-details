import glassSurfaceClasses from './GlassSurface.module.css';
import styles from './FloatingBar.module.css';
import { floatingReducer, floatingSemantics } from '@ilovecode33/ui-core';
import type { FloatingState } from '@ilovecode33/ui-types';
import { useReducer, type ReactNode } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { PressGlow } from './PressGlow';
import { useDeform } from '../hooks/useDeform';

/**
 * Floating glass surface hosting top/bottom/leading chrome above content (the
 * host reserves scroll space). Optional toggle controls collapse: controlled
 * when `collapsed` is passed, otherwise internal, with `onCollapsedChange`
 * always notified. Deformation is on by default and reduced-motion aware;
 * `collapseLabel`/`expandLabel` default to English, `label` is caller-supplied.
 */

export function FloatingBar({
  position = 'bottom',
  label,
  className = '',
  collapsible = false,
  collapsed: controlledCollapsed,
  onCollapsedChange,
  collapseLabel = 'Collapse',
  expandLabel = 'Expand',
  deform = true,
  children,
}: {
  position?: 'top' | 'bottom' | 'leading';
  label?: string;
  className?: string;
  collapsible?: boolean;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  collapseLabel?: string;
  expandLabel?: string;
  deform?: boolean;
  children: ReactNode;
}) {
  const motion = useDeform({ enabled: deform });
  const [state, dispatch] = useReducer(floatingReducer, {
    collapsed: false,
    hidden: false,
  });
  const current: FloatingState = {
    ...state,
    collapsed: controlledCollapsed ?? state.collapsed,
  };
  const semantics = floatingSemantics(current, label);

  const toggle = () => {
    const next = !current.collapsed;
    if (controlledCollapsed === undefined) dispatch({ type: 'toggleCollapse' });
    onCollapsedChange?.(next);
  };

  return (
    <div
      data-ui="floating-bar"
      className={[styles['ui-floating'], styles[`ui-floating--${position}`], styles[current.collapsed ? 'is-collapsed' : ''] || '', className].filter(Boolean).join(' ')}
    >
      <div
        className={[glassSurfaceClasses['ui-glass'], styles['ui-floating__surface'], styles[current.collapsed ? 'is-collapsed' : ''] || ''].filter(Boolean).join(' ')}
        role={semantics.role}
        aria-label={semantics.label}
        style={motion.style}
        {...(deform ? motion.handlers : {})}
      >
        {deform && <PressGlow pulse={motion.pulse} />}
        <div className={styles['ui-floating__content']}>{children}</div>
        {collapsible && (
          <button
            type="button"
            className={styles['ui-floating__toggle']}
            aria-expanded={semantics.expanded}
            aria-label={current.collapsed ? expandLabel : collapseLabel}
            onClick={toggle}
          >
            {current.collapsed ? <ChevronUp /> : <ChevronDown />}
          </button>
        )}
      </div>
    </div>
  );
}
