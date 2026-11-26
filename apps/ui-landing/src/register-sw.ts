/**
 * Registers the production service worker so repeat visits load from cache.
 * Development and browsers without service worker support are no-ops.
 */
export function registerServiceWorker(): void {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) {
    return;
  }

  const register = () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Registration failure is non-fatal: the app still works without a cache.
    });
  };

  if (document.readyState === 'complete') {
    register();
  } else {
    window.addEventListener('load', register, { once: true });
  }
}
