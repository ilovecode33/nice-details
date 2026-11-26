import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Skeleton } from '@ilovecode33/ui';

/**
 * The Photo Wall demo pulls in the full renderer and its styles, making it by
 * far the heaviest chunk on the landing page. Keep it out of the first load.
 */
const loadPhotoWallDemo = () => import('./photo-wall-demo');

const PhotoWallDemo = lazy(() =>
  loadPhotoWallDemo().then((module) => ({ default: module.PhotoWallDemo })),
);

/**
 * Mirrors the demo's layout (hint, square stage, controls) so the reserved
 * space matches what replaces it. Hidden from assistive technology because it
 * conveys no information and is only here to prevent layout shift.
 */
function PhotoWallPlaceholder() {
  return (
    <div className="pw-demo" aria-hidden="true">
      <Skeleton width="35%" />
      <div className="pw-demo__stage">
        <Skeleton width="100%" height="100%" />
      </div>
      <div className="pw-demo__controls">
        <Skeleton width="100%" />
        <Skeleton width="100%" />
        <Skeleton width="100%" />
      </div>
    </div>
  );
}

export function LazyPhotoWallDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  // Warm the browser cache during idle time so in-page navigation and the
  // next page open can use the already-downloaded chunk.
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const prefetch = () => {
      void loadPhotoWallDemo();
    };

    if (typeof window.requestIdleCallback === 'function') {
      const handle = window.requestIdleCallback(prefetch);
      return () => window.cancelIdleCallback(handle);
    }

    const timer = window.setTimeout(prefetch, 1200);
    return () => window.clearTimeout(timer);
  }, []);

  // Only mount the real demo once it is close to the viewport, then stop
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
        <Suspense fallback={<PhotoWallPlaceholder />}>
          <PhotoWallDemo />
        </Suspense>
      ) : (
        <PhotoWallPlaceholder />
      )}
    </div>
  );
}
