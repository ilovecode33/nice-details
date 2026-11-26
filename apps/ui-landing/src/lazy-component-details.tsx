import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import type { ComponentDetailsProps } from './component-details';
import {
  initialDetailsHeight,
  initialScrollY,
  restoreScrollPosition,
  saveDetailsHeight,
} from './scroll-restore';

/**
 * The component-detail demos pull in most of the UI library, so they stay out
 * of the first paint. The hero renders synchronously; this chunk is warmed
 * during idle time and mounted only once the detail section is near the view.
 */
const loadComponentDetails = () => import('./component-details');

const ComponentDetails = lazy(() =>
  loadComponentDetails().then((module) => ({ default: module.ComponentDetails })),
);

/**
 * Reserves the section's space and keeps the `details` anchor available to the
 * hero CTA before the real module has loaded. The cached height from the last
 * render keeps a reload from collapsing the page while the chunk downloads.
 * Hidden from assistive technology because it conveys no information of its own.
 */
function ComponentDetailsPlaceholder() {
  return (
    <div
      id="details"
      aria-hidden="true"
      style={{ minHeight: initialDetailsHeight ? `${initialDetailsHeight}px` : '60vh' }}
    />
  );
}

export function LazyComponentDetails(props: ComponentDetailsProps) {
  const ref = useRef<HTMLDivElement>(null);
  const observerRef = useRef<ResizeObserver | null>(null);
  const restoredRef = useRef(false);
  // A deep saved position means the observer would never fire on reload, so
  // load the chunk immediately. A fresh visit keeps the hero-first behavior.
  const [shouldLoad, setShouldLoad] = useState(() => initialScrollY > 0);

  // Warm the browser cache during idle time so scrolling into the details
  // section, or a later navigation, can use the already-downloaded chunk.
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const prefetch = () => {
      void loadComponentDetails();
    };

    if (typeof window.requestIdleCallback === 'function') {
      const handle = window.requestIdleCallback(prefetch);
      return () => window.cancelIdleCallback(handle);
    }

    const timer = window.setTimeout(prefetch, 1200);
    return () => window.clearTimeout(timer);
  }, []);

  // Only mount the real demos once they are close to the viewport, then stop
  // observing. Falls back eagerly where IntersectionObserver is unavailable.
  useEffect(() => {
    if (shouldLoad || typeof window === 'undefined') return;
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === 'undefined') {
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: '600px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [shouldLoad]);

  // Called by ComponentDetails after it mounts: cache the real height (and
  // keep it fresh on layout changes), then restore the saved position once.
  const handleReady = useCallback(() => {
    if (typeof window === 'undefined') return;

    const measure = () => {
      const section = document.getElementById('details');
      if (section) saveDetailsHeight(section.getBoundingClientRect().height);
    };

    measure();

    const section = document.getElementById('details');
    if (section && typeof ResizeObserver !== 'undefined') {
      observerRef.current?.disconnect();
      const observer = new ResizeObserver(measure);
      observer.observe(section);
      observerRef.current = observer;
    }

    if (!restoredRef.current) {
      restoredRef.current = true;
      if (initialScrollY > 0) restoreScrollPosition(initialScrollY);
    }
  }, []);

  useEffect(() => () => observerRef.current?.disconnect(), []);

  return (
    <div ref={ref}>
      {shouldLoad ? (
        <Suspense fallback={<ComponentDetailsPlaceholder />}>
          <ComponentDetails {...props} onReady={handleReady} />
        </Suspense>
      ) : (
        <ComponentDetailsPlaceholder />
      )}
    </div>
  );
}
