import classes from './FloatingBar.module.css';
import {
  floatingReducer,
  floatingSemantics,
  type FloatingState,
} from '@ilovecode33/ui-core';
import { useReducer, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { PressGlow } from './PressGlow';
import { useDeform } from './Deformable';
import { createCn } from '../css';

const cn = createCn(classes);

/**
 * Floating chrome primitives. Material values come from `@ilovecode33/ui-tokens`;
 * collapse state and semantics come from `@ilovecode33/ui-core`.
 *
 * These surfaces float above content instead of occupying layout space. The
 * host is responsible for reserving room (padding / scroll-padding) so content
 * is never covered.
 */


/* ── FloatingBar ──────────────────────────────────────────────────────────── */

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
      className={cn(
        `ui-floating ui-floating--${position} ${current.collapsed ? 'is-collapsed' : ''} ${className}`,
      )}
    >
      <div
        className={cn(
          `ui-glass ui-floating__surface ${current.collapsed ? 'is-collapsed' : ''}`,
        )}
        role={semantics.role}
        aria-label={semantics.label}
        style={motion.style}
        {...(deform ? motion.handlers : {})}
      >
        {deform && <PressGlow pulse={motion.pulse} />}
        <div className={cn('ui-floating__content')}>{children}</div>
        {collapsible && (
          <button
            type="button"
            className={cn('ui-floating__toggle')}
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
