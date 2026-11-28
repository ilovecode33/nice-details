import { describe, expect, test } from '@rstest/core';
import { isIOSSafari, isStandalone } from './pwa';

describe('pwa helpers', () => {
  test('detects iPhone and iPad user agents', () => {
    const original = navigator.userAgent;
    try {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
        configurable: true,
      });
      expect(isIOSSafari()).toBe(true);
    } finally {
      Object.defineProperty(navigator, 'userAgent', {
        value: original,
        configurable: true,
      });
    }
  });

  test('treats a standalone display mode as installed', () => {
    const original = window.matchMedia;
    try {
      window.matchMedia = ((query: string) => ({
        matches: query === '(display-mode: standalone)',
      })) as typeof window.matchMedia;
      expect(isStandalone()).toBe(true);
    } finally {
      window.matchMedia = original;
    }
  });

  test('a normal tab is not standalone', () => {
    const original = window.matchMedia;
    try {
      window.matchMedia = ((query: string) => ({
        matches: false,
      })) as typeof window.matchMedia;
      expect(isStandalone()).toBe(false);
    } finally {
      window.matchMedia = original;
    }
  });
});
