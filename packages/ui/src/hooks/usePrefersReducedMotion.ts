import { useEffect, useState } from 'react';

/**
 * Track the `prefers-reduced-motion: reduce` media query. Initializes from the
 * current match (false on the server) and subscribes to changes for the lifetime
 * of the component. Returns true while the user requests reduced motion.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduced(query.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);
  return reduced;
}
