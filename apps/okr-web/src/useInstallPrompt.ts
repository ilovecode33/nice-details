import { useCallback, useEffect, useState } from 'react';
import { isIOSSafari, isStandalone } from './pwa';

/** Event Chromium fires when the app meets the install criteria. */
interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export interface InstallPromptState {
  /** Already opened from the home screen or dock. */
  installed: boolean;
  /** A browser prompt is available (Chromium and compatible browsers). */
  canPrompt: boolean;
  /** iOS Safari has no prompt API, only Share → Add to Home Screen. */
  ios: boolean;
  prompt: () => Promise<void>;
}

/**
 * Tracks installability: listens for `beforeinstallprompt`, keeps the deferred
 * event for a custom button, and notices when the app becomes standalone.
 * Browsers without the event fall back to manual instructions.
 */
export function useInstallPrompt(): InstallPromptState {
  const [deferred, setDeferred] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(isStandalone);
  const ios = isIOSSafari();

  useEffect(() => {
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setDeferred(event as InstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };
    const media = window.matchMedia?.('(display-mode: standalone)');
    const onModeChange = () => setInstalled(isStandalone());

    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    media?.addEventListener?.('change', onModeChange);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
      media?.removeEventListener?.('change', onModeChange);
    };
  }, []);

  const prompt = useCallback(async () => {
    if (!deferred) return;
    try {
      await deferred.prompt();
      await deferred.userChoice;
    } finally {
      setDeferred(null);
    }
  }, [deferred]);

  return { installed, canPrompt: deferred !== null, ios, prompt };
}
