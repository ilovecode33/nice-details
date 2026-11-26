/**
 * Manual scroll restoration for the landing page.
 *
 * The component-details chunk is lazy-loaded, so the browser's automatic
 * restoration would jump before the real content (and its height) exists.
 * This module keeps the scroll position and the rendered details height in
 * sessionStorage and restores the position once the real section is mounted.
 */

const SCROLL_Y_KEY = 'ui-landing.scrollY';
const DETAILS_HEIGHT_KEY = 'ui-landing.detailsHeight';

function getStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function readPositiveNumber(key: string): number {
  const store = getStorage();
  if (!store) return 0;
  const value = Number(store.getItem(key));
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function writeNumber(key: string, value: number): void {
  if (!Number.isFinite(value) || value < 0) return;
  getStorage()?.setItem(key, String(Math.round(value)));
}

/**
 * Values from the previous page load, captured at module evaluation time so
 * that in-page scrolling cannot overwrite the target before restoration.
 */
export const initialScrollY = readPositiveNumber(SCROLL_Y_KEY);
export const initialDetailsHeight = readPositiveNumber(DETAILS_HEIGHT_KEY);

/** Cache the height of the rendered details section for the next reload. */
export function saveDetailsHeight(height: number): void {
  writeNumber(DETAILS_HEIGHT_KEY, height);
}

let pendingFrame: number | null = null;
let pendingY = 0;

/** Persist scrollY at most once per animation frame. */
export function scheduleScrollSave(y: number): void {
  if (typeof window === 'undefined') return;
  pendingY = y;
  if (pendingFrame !== null) return;

  if (typeof window.requestAnimationFrame !== 'function') {
    writeNumber(SCROLL_Y_KEY, pendingY);
    return;
  }

  pendingFrame = window.requestAnimationFrame(() => {
    pendingFrame = null;
    writeNumber(SCROLL_Y_KEY, pendingY);
  });
}

/** Flush a pending frame and write the live position synchronously. */
export function flushScrollSave(): void {
  if (typeof window === 'undefined') return;
  if (pendingFrame !== null && typeof window.cancelAnimationFrame === 'function') {
    window.cancelAnimationFrame(pendingFrame);
    pendingFrame = null;
  }
  writeNumber(SCROLL_Y_KEY, window.scrollY);
}

/**
 * Install the passive scroll and pagehide listeners that keep sessionStorage
 * in sync with the live scroll position. Returns a cleanup function.
 */
export function installScrollPersistence(): () => void {
  if (typeof window === 'undefined') return () => undefined;

  const onScroll = () => scheduleScrollSave(window.scrollY);
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('pagehide', flushScrollSave);

  return () => {
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('pagehide', flushScrollSave);
  };
}

/**
 * Restore the saved position after layout has settled. Two animation frames
 * give the freshly mounted details section time to lay out before we jump,
 * and the synthetic scroll event lets App recompute its active group/dock.
 */
export function restoreScrollPosition(y: number): void {
  if (typeof window === 'undefined') return;

  const apply = () => {
    window.scrollTo(0, y);
    window.dispatchEvent(new Event('scroll'));
  };

  if (typeof window.requestAnimationFrame !== 'function') {
    apply();
    return;
  }

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(apply);
  });
}
