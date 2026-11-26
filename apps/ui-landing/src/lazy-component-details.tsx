import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import type { ComponentDetailsProps } from './component-details';

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
 * hero CTA before the real module has loaded. Hidden from assistive technology
 * because it conveys no information of its own.
 */
function ComponentDetailsPlaceholder() {
  return <div id="details" aria-hidden="true" style={{ minHeight: '60vh' }} />;
}

export function LazyComponentDetails(props: ComponentDetailsProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

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

  return (
    <div ref={ref}>
      {shouldLoad ? (
        <Suspense fallback={<ComponentDetailsPlaceholder />}>
          <ComponentDetails {...props} />
        </Suspense>
      ) : (
        <ComponentDetailsPlaceholder />
      )}
    </div>
  );
}
