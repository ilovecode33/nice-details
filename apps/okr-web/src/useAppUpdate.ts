import { useCallback, useEffect, useRef, useState } from 'react';

export interface AppUpdateState {
  /** A newer app version or build is available to reload. */
  updateReady: boolean;
  checking: boolean;
  latestVersion: string | null;
  checkFailed: boolean;
  /** Reloads after the user chooses to apply the update. */
  update: () => void;
}

export interface AppUpdateOptions {
  /** Overrides production-only polling and service-worker listeners (used in tests). */
  enabled?: boolean;
}

interface DeployedBuild {
  version: string;
  build: string | null;
}

const VERSION_PATTERN = /^\d+\.\d+\.\d+$/;
const UPDATE_CHECK_INTERVAL = 15 * 60 * 1000;

/** Returns true when `candidate` is strictly higher than `current` (major.minor.patch). */
export function isNewerVersion(candidate: string, current: string): boolean {
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

/** Extracts deployed version and build identifiers from HTML `<meta>` tags. */
export function parseDeployedBuild(html: string): DeployedBuild {
  const document = new DOMParser().parseFromString(html, 'text/html');
  const version = document
    .querySelector('meta[name="app-version"]')
    ?.getAttribute('content')
    ?.trim();
  if (!version || !VERSION_PATTERN.test(version)) {
    throw new Error('Latest app version is unavailable');
  }
  const build =
    document
      .querySelector('meta[name="app-build"]')
      ?.getAttribute('content')
      ?.trim() || null;
  return { version, build };
}

async function fetchDeployedBuild(): Promise<DeployedBuild> {
  const url = new URL(window.location.href);
  url.hash = '';
  url.searchParams.set('__version_check', String(Date.now()));
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) throw new Error('Version check failed');
  return parseDeployedBuild(await response.text());
}

/**
 * Checks the deployed version on launch, when the app becomes visible, and
 * periodically while open. It never reloads unless the user chooses Update now.
 */
export function useAppUpdate(
  currentVersion: string,
  currentBuild?: string,
  { enabled = import.meta.env.PROD }: AppUpdateOptions = {},
): AppUpdateState {
  const [workerUpdateReady, setWorkerUpdateReady] = useState(false);
  const [checking, setChecking] = useState(false);
  const [latestVersion, setLatestVersion] = useState<string | null>(null);
  const [latestBuild, setLatestBuild] = useState<string | null>(null);
  const [checkFailed, setCheckFailed] = useState(false);
  const checkingRef = useRef(false);

  const checkForUpdates = useCallback(async () => {
    if (checkingRef.current) return;
    checkingRef.current = true;
    setChecking(true);
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
      const deployed = await fetchDeployedBuild();
      setLatestVersion(deployed.version);
      setLatestBuild(deployed.build);
    } catch {
      setCheckFailed(true);
    } finally {
      checkingRef.current = false;
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    const markReady = () => {
      if (!cancelled) setWorkerUpdateReady(true);
    };

    if ('serviceWorker' in navigator) {
      void navigator.serviceWorker
        .getRegistration()
        .then((registration) => {
          if (cancelled || !registration) return;
          if (registration.waiting) markReady();
          registration.addEventListener('updatefound', () => {
            // Initial registration has no active controller yet; its SW matches this load.
            if (!navigator.serviceWorker.controller) return;
            const worker = registration.installing;
            worker?.addEventListener('statechange', () => {
              if (worker.state === 'installed' || worker.state === 'activated') {
                markReady();
              }
            });
          });
        })
        .catch(() => {});
    }

    const checkWhenVisible = () => {
      if (document.visibilityState === 'visible') {
        void checkForUpdates();
      }
    };
    checkWhenVisible();
    document.addEventListener('visibilitychange', checkWhenVisible);
    const interval = window.setInterval(checkWhenVisible, UPDATE_CHECK_INTERVAL);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', checkWhenVisible);
      window.clearInterval(interval);
    };
  }, [checkForUpdates, enabled]);

  const update = useCallback(() => {
    const refreshUrl = new URL(window.location.href);
    refreshUrl.pathname = '/';
    refreshUrl.hash = '';
    refreshUrl.search = '';
    refreshUrl.searchParams.set('__refresh', String(Date.now()));
    void fetch(refreshUrl, { cache: 'no-store' })
      .catch(() => undefined)
      .finally(() => {
        window.location.reload();
      });
  }, []);

  const hasNewerVersion =
    latestVersion !== null && isNewerVersion(latestVersion, currentVersion);
  const sameBuildId =
    Boolean(currentBuild && latestBuild) && latestBuild === currentBuild;
  const sameDeployedBuild = latestVersion === currentVersion && sameBuildId;
  const hasNewerBuild =
    latestVersion === currentVersion &&
    Boolean(currentBuild && latestBuild && !sameBuildId);

  return {
    updateReady:
      hasNewerVersion || hasNewerBuild || (workerUpdateReady && !sameDeployedBuild),
    checking,
    latestVersion,
    checkFailed,
    update,
  };
}
