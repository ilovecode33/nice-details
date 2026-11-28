import { afterEach, describe, expect, rs, test } from '@rstest/core';
import { resetHapticThrottle, triggerHaptic } from './haptics';

const originalVibrate = navigator.vibrate;
const originalMatchMedia = window.matchMedia;
const originalMaxTouchPoints = navigator.maxTouchPoints;

afterEach(() => {
  resetHapticThrottle();
  Object.defineProperty(navigator, 'vibrate', {
    configurable: true,
    value: originalVibrate,
  });
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: originalMatchMedia,
  });
  Object.defineProperty(navigator, 'maxTouchPoints', {
    configurable: true,
    value: originalMaxTouchPoints,
  });
});

function mockMedia({
  reducedMotion = false,
  coarsePointer = false,
}: {
  reducedMotion?: boolean;
  coarsePointer?: boolean;
} = {}) {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: (query: string) => ({
      matches:
        (query === '(prefers-reduced-motion: reduce)' && reducedMotion) ||
        (query === '(pointer: coarse)' && coarsePointer),
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

describe('triggerHaptic', () => {
  test('calls navigator.vibrate with 20ms for selection and 35ms for impact', () => {
    mockMedia();
    const vibrate = rs.fn(() => true);
    Object.defineProperty(navigator, 'vibrate', { configurable: true, value: vibrate });

    expect(triggerHaptic('selection')).toBe(true);
    expect(vibrate).toHaveBeenCalledWith(20);

    resetHapticThrottle();
    expect(triggerHaptic('impact')).toBe(true);
    expect(vibrate).toHaveBeenCalledWith(35);
  });

  test('throttles consecutive calls within 32ms', () => {
    mockMedia();
    const vibrate = rs.fn(() => true);
    Object.defineProperty(navigator, 'vibrate', { configurable: true, value: vibrate });

    expect(triggerHaptic('selection')).toBe(true);
    expect(triggerHaptic('selection')).toBe(false);
    expect(vibrate).toHaveBeenCalledTimes(1);
  });

  test('suppresses haptics when prefers-reduced-motion is enabled', () => {
    mockMedia({ reducedMotion: true, coarsePointer: true });
    const vibrate = rs.fn(() => true);
    Object.defineProperty(navigator, 'vibrate', { configurable: true, value: vibrate });

    expect(triggerHaptic('selection')).toBe(false);
    expect(vibrate).not.toHaveBeenCalled();
  });

  test('mounts and reuses a persistent switch input + label singleton on touch devices without vibrate', () => {
    mockMedia({ coarsePointer: true });
    Object.defineProperty(navigator, 'vibrate', { configurable: true, value: undefined });
    Object.defineProperty(navigator, 'maxTouchPoints', { configurable: true, value: 5 });

    const clickedSwitches: boolean[] = [];
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLInputElement | null;
      if (target instanceof HTMLInputElement) {
        clickedSwitches.push(target.hasAttribute('switch'));
      }
    };
    document.body.addEventListener('click', onClick);

    try {
      expect(triggerHaptic('selection')).toBe(true);
      const firstInput = document.getElementById('ui-haptic-switch');
      const firstLabel = document.querySelector('label[for="ui-haptic-switch"]');
      expect(firstInput).not.toBeNull();
      expect(firstLabel).not.toBeNull();

      resetHapticThrottle();
      // After resetHapticThrottle removes them, a new call recreates the singleton;
      // before reset, repeated calls reuse the exact same elements.
      expect(triggerHaptic('selection')).toBe(true);
      const reusedInput = document.getElementById('ui-haptic-switch');
      expect(reusedInput).not.toBeNull();
      expect(clickedSwitches).toEqual([true, true]);

      resetHapticThrottle();
      expect(document.getElementById('ui-haptic-switch')).toBeNull();
      expect(document.querySelector('label[for="ui-haptic-switch"]')).toBeNull();
    } finally {
      document.body.removeEventListener('click', onClick);
    }
  });

  test('reuses the same persistent switch singleton across unthrottled triggers', () => {
    mockMedia({ coarsePointer: true });
    Object.defineProperty(navigator, 'vibrate', { configurable: true, value: undefined });
    Object.defineProperty(navigator, 'maxTouchPoints', { configurable: true, value: 5 });

    const nowSpy = rs.spyOn(performance, 'now');
    nowSpy.mockReturnValueOnce(100).mockReturnValueOnce(200);

    try {
      expect(triggerHaptic('selection')).toBe(true);
      const input1 = document.getElementById('ui-haptic-switch');
      const label1 = document.querySelector('label[for="ui-haptic-switch"]');

      expect(triggerHaptic('selection')).toBe(true);
      const input2 = document.getElementById('ui-haptic-switch');
      const label2 = document.querySelector('label[for="ui-haptic-switch"]');

      expect(input2).toBe(input1);
      expect(label2).toBe(label1);
    } finally {
      nowSpy.mockRestore();
    }
  });

  test('returns false on non-touch desktop environments without navigator.vibrate', () => {
    mockMedia({ coarsePointer: false });
    Object.defineProperty(navigator, 'vibrate', { configurable: true, value: undefined });
    Object.defineProperty(navigator, 'maxTouchPoints', { configurable: true, value: 0 });

    expect(triggerHaptic('selection')).toBe(false);
  });
});
