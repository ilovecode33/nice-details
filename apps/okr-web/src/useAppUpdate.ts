import { useCallback, useEffect, useState } from 'react';

export interface AppUpdateState {
  /** A newer app version or build is available to reload. */
  updateReady: boolean;
  checking: boolean;
  latestVersion: string | null;
  checkFailed: boolean;
  /** Checks the deployed app version without reloading. */
  checkForUpdates: () => Promise<void>;
  /** Reloads after the user chooses to apply the update. */
  update: () => void;
}

const VERSION_PATTERN = /^\d+\.\d+\.\d+$/;

function isNewerVersion(candidate: string, current: string): boolean {
  if (!VERSION_PATTERN.test(candidate) || !VERSION_PATTERN.test(current)) {
    return false;
  }
  const candidateParts = candidate.split('.').map(Number);
  const currentParts = current.split('.').map(Number);
  for (let index = 0; index < 3; index += 1) {
    if (candidateParts[index] !== currentParts[index]) {
      return candidateParts[index] > currentParts[index];
    }
  }
  return false;
}

async function fetchLatestVersion(): Promise<string> {
  const url = new URL(window.location.href);
  url.hash = '';
  url.searchParams.set('__version_check', String(Date.now()));
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) throw new Error('Version check failed');

  const html = await response.text();
  const document = new DOMParser().parseFromString(html, 'text/html');
  const version = document
    .querySelector('meta[name="app-version"]')
    ?.getAttribute('content')
    ?.trim();
  if (!version || !VERSION_PATTERN.test(version)) {
    throw new Error('Latest app version is unavailable');
  }
  return version;
}

/**
 * Reports the deployed app version separately from installing it. A visible
 * page may check the service worker automatically, but only Update now reloads.
 */
export function useAppUpdate(currentVersion: string): AppUpdateState {
  const [workerUpdateReady, setWorkerUpdateReady] = useState(false);
  const [checking, setChecking] = useState(false);
  const [latestVersion, setLatestVersion] = useState<string | null>(null);
  const [checkFailed, setCheckFailed] = useState(false);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }
    let cancelled = false;
    let registration: ServiceWorkerRegistration | null = null;
    const markReady = () => {
      if (!cancelled) setWorkerUpdateReady(true);
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

  const checkForUpdates = useCallback(async () => {
    setChecking(true);
    setLatestVersion(null);
    setCheckFailed(false);
    try {
      if ('serviceWorker' in navigator) {
        void navigator.serviceWorker
          .getRegistration()
          .then((registration) => registration?.update())
          .catch(() => {
            /* Version lookup below still works when service-worker checks fail. */
          });
      }
      setLatestVersion(await fetchLatestVersion());
    } catch {
      setCheckFailed(true);
    } finally {
      setChecking(false);
    }
  }, []);

  const update = useCallback(() => {
    window.location.reload();
  }, []);

  return {
    updateReady:
      workerUpdateReady ||
      (latestVersion !== null && isNewerVersion(latestVersion, currentVersion)),
    checking,
    latestVersion,
    checkFailed,
    checkForUpdates,
    update,
  };
}
