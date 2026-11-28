const HAPTIC_THROTTLE_MS = 32;
const SELECTION_MS = 8;
const IMPACT_MS = 14;

export type HapticStyle = 'selection' | 'impact';

let lastHapticAt = -Infinity;

function nowMs(): number {
  return typeof performance !== 'undefined' ? performance.now() : Date.now();
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

function isTouchCapable(): boolean {
  return (
    (typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(pointer: coarse)').matches) ||
    (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0)
  );
}

/**
 * Triggers a subtle, throttled mobile haptic pulse: uses `navigator.vibrate` on
 * Android/supporting browsers and falls back to clicking a transient hidden
 * `<input type="checkbox" switch>` label for iOS 17.4+ Taptic Engine feedback.
 */
export function triggerHaptic(style: HapticStyle = 'selection'): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  if (prefersReducedMotion()) return false;

  const now = nowMs();
  if (now - lastHapticAt < HAPTIC_THROTTLE_MS) return false;

  if (typeof navigator.vibrate === 'function') {
    const didVibrate = navigator.vibrate(style === 'impact' ? IMPACT_MS : SELECTION_MS);
    if (didVibrate !== false) {
      lastHapticAt = now;
      return true;
    }
  }

  if (!isTouchCapable() || typeof document === 'undefined' || !document.body) {
    return false;
  }

  const label = document.createElement('label');
  const input = document.createElement('input');
  input.type = 'checkbox';
  input.setAttribute('switch', '');
  input.tabIndex = -1;
  input.setAttribute('aria-hidden', 'true');
  label.setAttribute('aria-hidden', 'true');
  label.style.cssText =
    'position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;overflow:hidden;';
  label.append(input);
  document.body.append(label);
  try {
    label.click();
  } finally {
    label.remove();
  }
  lastHapticAt = now;
  return true;
}

/** Resets the haptic throttle timestamp; intended for tests. */
export function resetHapticThrottle(): void {
  lastHapticAt = -Infinity;
}
