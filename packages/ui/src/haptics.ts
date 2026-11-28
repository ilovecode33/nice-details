const HAPTIC_THROTTLE_MS = 32;
const SELECTION_MS = 20;
const IMPACT_MS = 35;
const HAPTIC_INPUT_ID = 'ui-haptic-switch';

export type HapticStyle = 'selection' | 'impact';

let lastHapticAt = -Infinity;
let iosInput: HTMLInputElement | null = null;
let iosLabel: HTMLLabelElement | null = null;

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

function ensureIosSwitchLabel(): HTMLLabelElement | null {
  if (typeof document === 'undefined' || !document.body) return null;
  if (iosLabel?.isConnected && iosInput?.isConnected) return iosLabel;

  const input = document.createElement('input');
  input.type = 'checkbox';
  input.id = HAPTIC_INPUT_ID;
  input.setAttribute('switch', '');
  input.tabIndex = -1;
  input.setAttribute('aria-hidden', 'true');
  input.style.display = 'none';

  const label = document.createElement('label');
  label.htmlFor = HAPTIC_INPUT_ID;
  label.setAttribute('aria-hidden', 'true');
  label.style.display = 'none';

  document.body.append(input, label);
  iosInput = input;
  iosLabel = label;
  return label;
}

/**
 * Triggers a subtle, throttled mobile haptic pulse: uses `navigator.vibrate` on
 * Android/supporting browsers and falls back to clicking a persistent hidden
 * `<label>` bound to `<input type="checkbox" switch>` for iOS 17.4+ Taptic
 * Engine feedback.
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

  if (!isTouchCapable()) return false;

  const label = ensureIosSwitchLabel();
  if (!label) return false;

  label.click();
  lastHapticAt = now;
  return true;
}

/** Resets throttle state and removes any injected iOS switch elements; intended for tests. */
export function resetHapticThrottle(): void {
  lastHapticAt = -Infinity;
  iosInput?.remove();
  iosLabel?.remove();
  iosInput = null;
  iosLabel = null;
}
