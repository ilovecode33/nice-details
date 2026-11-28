/**
 * Small PWA helpers. The app is installable from the browser menu, and the
 * service worker keeps the last good shell for offline opens.
 */

/** True when the app runs as an installed PWA (standalone window). */
export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  const navigatorWithStandalone = window.navigator as Navigator & {
    standalone?: boolean;
  };
  return (
    window.matchMedia?.('(display-mode: standalone)').matches === true ||
    navigatorWithStandalone.standalone === true
  );
}

/** iPadOS reports a desktop Mac user agent, so touch points are the tell. */
export function isIOSSafari(): boolean {
  if (typeof navigator === 'undefined') return false;
  if (/iPad|iPhone|iPod/.test(navigator.userAgent)) return true;
  return navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
}

/**
 * Registers the production service worker so the second open can come from
 * cache. Development and browsers without service worker support are no-ops.
 */
export function registerServiceWorker(): void {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;

  const register = () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Registration failure is non-fatal: the app still works online.
    });
  };

  if (document.readyState === 'complete') {
    register();
  } else {
    window.addEventListener('load', register, { once: true });
  }
}
