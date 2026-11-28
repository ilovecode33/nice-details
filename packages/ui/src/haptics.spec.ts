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
  test('calls navigator.vibrate with 8ms for selection and 14ms for impact', () => {
    mockMedia();
    const vibrate = rs.fn(() => true);
    Object.defineProperty(navigator, 'vibrate', { configurable: true, value: vibrate });

    expect(triggerHaptic('selection')).toBe(true);
    expect(vibrate).toHaveBeenCalledWith(8);

    resetHapticThrottle();
    expect(triggerHaptic('impact')).toBe(true);
    expect(vibrate).toHaveBeenCalledWith(14);
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

  test('falls back to a transient switch checkbox click on touch devices without vibrate', () => {
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
      expect(clickedSwitches).toEqual([true]);
      expect(document.body.children).toHaveLength(0);
    } finally {
      document.body.removeEventListener('click', onClick);
    }
  });

  test('returns false on non-touch desktop environments without navigator.vibrate', () => {
    mockMedia({ coarsePointer: false });
    Object.defineProperty(navigator, 'vibrate', { configurable: true, value: undefined });
    Object.defineProperty(navigator, 'maxTouchPoints', { configurable: true, value: 0 });

    expect(triggerHaptic('selection')).toBe(false);
  });
});
