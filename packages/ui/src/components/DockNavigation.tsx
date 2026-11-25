import styles from './DockNavigation.module.css';
import {
  forwardRef,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from 'react';
import { FloatingBar } from './FloatingBar';


/**
 * Reusable floating dock navigation — the collapsed bar sits in the bottom
 * trailing corner, expands into a wrapped panel, and keeps the active item
 * centered while collapsed. The morph is measured in pixels so a percentage
 * transform never has to resolve against the animating width.
 */


export interface DockItem {
  id: string;
  label: ReactNode;
  /** Renders an anchor instead of a button. */
  href?: string;
  icon?: ReactNode;
}

export interface DockNavigationHandle {
  toggle(): void;
  setCollapsed(collapsed: boolean): void;
}

export interface DockNavigationProps {
  items: readonly DockItem[];
  activeId?: string;
  /** Receives the click event so hosts can implement client-side navigation. */
  onSelect?: (id: string, event: ReactMouseEvent<HTMLElement>) => void;
  label?: string;
  collapsible?: boolean;
  /** Controlled collapse state. */
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  collapseLabel?: string;
  expandLabel?: string;
  deform?: boolean;
  className?: string;
}

interface Geometry {
  left: number;
  width: number;
  height: number;
}

function durationMs(variable: string, fallback: number): number {
  if (typeof window === 'undefined') return fallback;
  const raw = getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
  const value = Number.parseFloat(raw);
  if (!Number.isFinite(value)) return fallback;
  return raw.endsWith('ms') ? value : value * 1000;
}

function morphDurationMs(): number {
  return durationMs('--morph-dur', 260);
}

function dockScrollDurationMs(): number {
  return durationMs('--dock-scroll-dur', 240);
}

function morphEasing(): string {
  if (typeof window === 'undefined') return 'cubic-bezier(0.4, 0, 0.2, 1)';
  return (
    getComputedStyle(document.documentElement).getPropertyValue('--morph-ease').trim() ||
    'cubic-bezier(0.4, 0, 0.2, 1)'
  );
}

function measure(bar: HTMLElement, dock: HTMLElement): Geometry {
  const rect = bar.getBoundingClientRect();
  return {
    left: rect.left,
    width: rect.width,
    height: dock.getBoundingClientRect().height,
  };
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export const DockNavigation = forwardRef<DockNavigationHandle, DockNavigationProps>(
  function DockNavigation(
    {
      items,
      activeId,
      onSelect,
      label = 'Navigation',
      collapsible = true,
      collapsed: controlledCollapsed,
      defaultCollapsed = false,
      onCollapsedChange,
      collapseLabel = 'Collapse',
      expandLabel = 'Expand',
      deform = true,
      className = '',
    },
    ref,
  ) {
    const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed);
    const collapsed = controlledCollapsed ?? internalCollapsed;
    const dockRef = useRef<HTMLDivElement>(null);
    const before = useRef<Geometry | null>(null);
    const animations = useRef<{ bar?: Animation; dock?: Animation }>({});

    const changeCollapsed = (next: boolean) => {
      const dock = dockRef.current;
      const bar = dock?.closest<HTMLElement>('[data-ui="floating-bar"]');
      before.current = dock && bar ? measure(bar, dock) : null;
      if (controlledCollapsed === undefined) setInternalCollapsed(next);
      onCollapsedChange?.(next);
    };

    useImperativeHandle(
      ref,
      () => ({
        toggle: () => changeCollapsed(!collapsed),
        setCollapsed: changeCollapsed,
      }),
      [collapsed, controlledCollapsed, onCollapsedChange],
    );

    // The bar's start and end frames are measured as pixels, so neither the
    // left/width/transform mix nor the row-count reflow can snap mid-morph.
    useLayoutEffect(() => {
      const dock = dockRef.current;
      const from = before.current;
      before.current = null;
      if (!dock || !from || prefersReducedMotion()) return;

      const bar = dock.closest<HTMLElement>('[data-ui="floating-bar"]');
      if (!bar) return;

      const probe = bar.cloneNode(true) as HTMLElement;
      probe.style.position = 'fixed';
      probe.style.visibility = 'hidden';
      probe.style.pointerEvents = 'none';
      probe.style.transition = 'none';
      document.body.append(probe);
      const target = probe.getBoundingClientRect();
      const targetHeight =
        probe.querySelector<HTMLElement>('[data-ui="dock"]')?.getBoundingClientRect()
          .height ?? from.height;
      probe.remove();

      const duration = morphDurationMs();
      const easing = morphEasing();
      animations.current.bar?.cancel();
      animations.current.dock?.cancel();

      animations.current.bar = bar.animate(
        [
          { left: `${from.left}px`, width: `${from.width}px`, transform: 'none' },
          { left: `${target.left}px`, width: `${target.width}px`, transform: 'none' },
        ],
        { duration, easing },
      );

      if (Math.abs(targetHeight - from.height) >= 1) {
        const heightAnimation = dock.animate(
          [{ height: `${from.height}px` }, { height: `${targetHeight}px` }],
          { duration, easing },
        );
        dock.style.overflow = 'hidden';
        animations.current.dock = heightAnimation;
        const release = () => {
          dock.style.overflow = '';
        };
        heightAnimation.onfinish = release;
        heightAnimation.oncancel = release;
      }
    }, [collapsed]);

    // The strip scrolls horizontally; its viewport width changes throughout
    // the morph, so re-center every frame until the geometry settles. The
    // centering is an exponential follow rather than an instant assignment, so
    // changing the active item eases the strip to the new centre. A time-based
    // factor keeps the easing identical at 60 Hz and 120 Hz.
    useLayoutEffect(() => {
      if (!collapsed) return;
      const container = dockRef.current;
      if (!container) return;
      const reduced = prefersReducedMotion();
      const tau = Math.max(16, dockScrollDurationMs() / 3);
      const started = performance.now();
      const settleMs = morphDurationMs() + dockScrollDurationMs() + 80;
      let last = started;
      let frame = 0;
      const center = (now: number) => {
        const active = container.querySelector<HTMLElement>('[data-active="true"]');
        if (active) {
          const view = container.getBoundingClientRect();
          const item = active.getBoundingClientRect();
          const delta =
            item.left + item.width / 2 - (view.left + view.width / 2);
          if (reduced || Math.abs(delta) < 0.5) {
            container.scrollLeft += delta;
          } else {
            const step = Math.min(64, now - last);
            last = now;
            container.scrollLeft += delta * (1 - Math.exp(-step / tau));
          }
        }
        if (now - started < settleMs) frame = requestAnimationFrame(center);
      };
      frame = requestAnimationFrame(center);
      return () => cancelAnimationFrame(frame);
    }, [activeId, collapsed]);

    return (
      <FloatingBar
        position="bottom"
        label={label}
        collapsible={collapsible}
        collapsed={collapsed}
        onCollapsedChange={changeCollapsed}
        collapseLabel={collapseLabel}
        expandLabel={expandLabel}
        deform={deform}
        className={className}
      >
        <div
          key={collapsed ? 'compact' : 'expanded'}
          ref={dockRef}
          data-ui="dock"
          className={[styles['ui-dock'], styles['ui-dock--enter'], styles[collapsed ? 'is-collapsed' : ''] || '', styles[collapsed && items.length < 3 ? 'is-short' : ''] || ''].filter(Boolean).join(' ')}
        >
          {items.map((item) => {
            const current = item.id === activeId;
            const itemClass = [styles['ui-dock__item'], styles[collapsed && current ? 'is-current' : ''] || ''].filter(Boolean).join(' ');
            const content = (
              <>
                {item.icon}
                {item.label}
              </>
            );
            if (item.href) {
              return (
                <a
                  key={item.id}
                  href={item.href}
                  className={itemClass}
                  data-active={current}
                  aria-current={current ? 'page' : undefined}
                  onClick={(event) => onSelect?.(item.id, event)}
                >
                  {content}
                </a>
              );
            }
            return (
              <button
                key={item.id}
                type="button"
                className={itemClass}
                data-active={current}
                aria-current={current ? 'location' : undefined}
                onClick={(event) => onSelect?.(item.id, event)}
              >
                {content}
              </button>
            );
          })}
        </div>
      </FloatingBar>
    );
  },
);