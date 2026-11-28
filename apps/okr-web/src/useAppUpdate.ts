import { useCallback, useEffect, useState } from 'react';

export interface AppUpdateState {
  /** A newer worker is installed and waiting for a reload. */
  updateReady: boolean;
  checking: boolean;
  /** Checks the service worker, then reloads the app. */
  update: () => Promise<void>;
}

/**
 * Gives an installed PWA (or a Safari home-screen bookmark) an explicit update
 * path: check for a new service worker when the app becomes visible, expose an
 * "update ready" state, and reload on demand. The service worker is
 * network-first, so a reload also picks up a new HTML/JS build even when the
 * worker itself did not change.
 */
export function useAppUpdate(): AppUpdateState {
  const [updateReady, setUpdateReady] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }
    let cancelled = false;
    let registration: ServiceWorkerRegistration | null = null;
    const markReady = () => {
      if (!cancelled) setUpdateReady(true);
    };

    void navigator.serviceWorker.getRegistration().then((current) => {
      if (cancelled || !current) return;
      registration = current;
      if (current.waiting) markReady();
      current.addEventListener('updatefound', () => {
        const worker = current.installing;
        worker?.addEventListener('statechange', () => {
          if (worker.state === 'installed' || worker.state === 'activated') {
            markReady();
          }
        });
      });
    });

    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        void registration?.update().catch(() => {
          /* The next reload still fetches the latest shell. */
        });
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  const update = useCallback(async () => {
    setChecking(true);
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          await Promise.race([
            registration.update(),
            new Promise((resolve) => setTimeout(resolve, 3000)),
          ]);
        }
      }
    } catch {
      /* A failed check still reloads to fetch the latest shell. */
    }
    window.location.reload();
  }, []);

  return { updateReady, checking, update };
}
