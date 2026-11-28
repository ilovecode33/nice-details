import type { DockNavigationHandle, DockNavigationProps } from '@ilovecode33/ui-types';
import styles from './DockNavigation.module.css';
import { forwardRef, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';
import { FloatingBar } from './FloatingBar';
import { useSegmentPillDrag } from '../hooks/useSegmentPillDrag';

/**
 * Pixel geometry captured before a collapse or expand. Using pixel frames
 * instead of a percentage transform avoids resolving widths mid-morph.
 */

interface Geometry {
  left: number;
  width: number;
  height: number;
}

/**
 * Reads a CSS duration custom property from the root element and normalises
 * seconds to milliseconds. Returns `fallback` on the server or if unparsable.
 */
function durationMs(variable: string, fallback: number): number {
  if (typeof window === 'undefined') return fallback;
  const raw = getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
  const value = Number.parseFloat(raw);
  if (!Number.isFinite(value)) return fallback;
  return raw.endsWith('ms') ? value : value * 1000;
}

/** Returns the `--morph-dur` duration in milliseconds, defaulting to 260. */
function morphDurationMs(): number {
  return durationMs('--morph-dur', 260);
}

/** Returns the `--dock-scroll-dur` duration in milliseconds, defaulting to 240. */
function dockScrollDurationMs(): number {
  return durationMs('--dock-scroll-dur', 240);
}

/**
 * Returns the `--morph-ease` value from the root element, or the standard
 * material curve when unset or when there is no window.
 */
function morphEasing(): string {
  if (typeof window === 'undefined') return 'cubic-bezier(0.4, 0, 0.2, 1)';
  return (
    getComputedStyle(document.documentElement).getPropertyValue('--morph-ease').trim() ||
    'cubic-bezier(0.4, 0, 0.2, 1)'
  );
}

/**
 * Captures the bar's left edge and width plus the dock's height in pixels as
 * the starting frame of a morph, so the end frame can be measured against it.
 */
function measure(bar: HTMLElement, dock: HTMLElement): Geometry {
  const rect = bar.getBoundingClientRect();
  return {
    left: rect.left,
    width: rect.width,
    height: dock.getBoundingClientRect().height,
  };
}

/** Reports the `prefers-reduced-motion: reduce` media query; false on the server. */
function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/**
 * Floating dock that collapses to a compact strip and expands into a wrapped
 * panel, keeping the active item centred while collapsed. Collapse is controlled
 * when `collapsed` is passed, otherwise tracked internally; the ref exposes
 * `toggle`/`setCollapsed`. Item labels come from `items`; `label`, `collapseLabel`
 * and `expandLabel` are props with English defaults.
 */
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

    /**
     * Snapshots the current bar/dock geometry before a collapse change, updates
     * internal state only when uncontrolled, then notifies `onCollapsedChange`.
     */
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

      // Finish any in-flight morph first: its release restores the inline width
      // lock, so the probe clone below measures an unlocked bar.
      animations.current.bar?.cancel();
      animations.current.dock?.cancel();
      animations.current.bar = undefined;
      animations.current.dock = undefined;

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
      const probeDock = probe.querySelector<HTMLElement>('[data-ui="dock"]');
      const targetHeight = probeDock?.getBoundingClientRect().height ?? from.height;
      const targetWidth = probeDock?.getBoundingClientRect().width;
      probe.remove();

      const surface = bar.querySelector<HTMLElement>('[class*="ui-floating__surface"]');
      const previous = {
        width: dock.style.width,
        maxWidth: dock.style.maxWidth,
        flex: dock.style.flex,
        overflow: dock.style.overflow,
        surfaceOverflow: surface?.style.overflow ?? '',
      };
      let released = false;
      const release = () => {
        if (released) return;
        released = true;
        dock.style.width = previous.width;
        dock.style.maxWidth = previous.maxWidth;
        dock.style.flex = previous.flex;
        dock.style.overflow = previous.overflow;
        if (surface) surface.style.overflow = previous.surfaceOverflow;
      };

      // Lock the dock to the target layout width for the whole morph. Otherwise
      // its wrapped rows follow the animating bar width and the height cascades
      // (e.g. 3 rows → 2 → 1) instead of staying at the final row count. The
      // surface clips the early overflow as the bar widens.
      if (targetWidth) {
        dock.style.width = `${targetWidth}px`;
        dock.style.maxWidth = 'none';
        dock.style.flex = '0 0 auto';
        if (surface) surface.style.overflow = 'hidden';
      }

      const duration = morphDurationMs();
      const easing = morphEasing();

      const barAnimation = bar.animate(
        [
          { left: `${from.left}px`, width: `${from.width}px`, transform: 'none' },
          { left: `${target.left}px`, width: `${target.width}px`, transform: 'none' },
        ],
        { duration, easing },
      );
      animations.current.bar = barAnimation;
      barAnimation.onfinish = release;
      barAnimation.oncancel = release;

      if (Math.abs(targetHeight - from.height) >= 1) {
        const heightAnimation = dock.animate(
          [{ height: `${from.height}px` }, { height: `${targetHeight}px` }],
          { duration, easing },
        );
        dock.style.overflow = 'hidden';
        animations.current.dock = heightAnimation;
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

    const pill = useSegmentPillDrag({
      values: items.map((item) => item.id),
      value: activeId ?? items[0]?.id ?? '',
      onChange: (id) => onSelect?.(id),
      deform,
    });
    // The dock element is both the collapse geometry source and the pill track.
    const attachDock = (node: HTMLDivElement | null) => {
      dockRef.current = node;
      pill.trackRef.current = node;
    };

    return (
      <FloatingBar
        position="bottom"
        label={label}
        collapsible={collapsible}
        collapsed={collapsed}
        onCollapsedChange={changeCollapsed}
        collapseLabel={collapseLabel}
        expandLabel={expandLabel}
        deform={false}
        className={className}
      >
        <div
          key={collapsed ? 'compact' : 'expanded'}
          ref={attachDock}
          data-ui="dock"
          className={[styles['ui-dock'], styles['ui-dock--enter'], styles[collapsed ? 'is-collapsed' : ''] || '', styles[collapsed && items.length < 3 ? 'is-short' : ''] || ''].filter(Boolean).join(' ')}
          {...pill.handlers}
        >
          {pill.slots && (
            <div
              ref={pill.thumbRef}
              className={styles['ui-dock__thumb']}
              data-ui="dock__thumb"
              style={pill.thumbStyle}
            >
              <div
                ref={pill.shiftRef}
                className={[styles['ui-dock__thumb-shift'], pill.hoveredIndex === pill.activeIndex ? styles['is-hovered'] : ''].filter(Boolean).join(' ')}
                data-ui="dock__thumb-shift"
                style={pill.shiftStyle}
              />
            </div>
          )}
          {items.map((item, index) => {
            const current = item.id === activeId;
            const itemClass = [styles['ui-dock__item'], styles[current ? 'is-current' : ''] || ''].filter(Boolean).join(' ');
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
                  data-index={index}
                  className={itemClass}
                  onPointerEnter={() => pill.setHoveredIndex(index)}
                  onPointerLeave={() => pill.setHoveredIndex(null)}
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
                data-index={index}
                className={itemClass}
                onPointerEnter={() => pill.setHoveredIndex(index)}
                onPointerLeave={() => pill.setHoveredIndex(null)}
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
