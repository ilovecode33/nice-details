import { describe, expect, test } from '@rstest/core';
import { SURFACES } from '@ilovecode33/ui-tokens';
import { applyThemeChrome } from './themeChrome';

const meta = (name: string) =>
  document
    .querySelector(`meta[name="${name}"]`)
    ?.getAttribute('content') ?? null;

describe('applyThemeChrome', () => {
  test('dark theme paints the dark background and a translucent status bar', () => {
    const head = document.head.innerHTML;
    try {
      document.head.innerHTML =
        '<meta name="theme-color" content="none"><meta name="apple-mobile-web-app-status-bar-style" content="default">';
      applyThemeChrome('dark');
      expect(meta('theme-color')).toBe(SURFACES.dark.bg);
      expect(meta('apple-mobile-web-app-status-bar-style')).toBe(
        'black-translucent',
      );
    } finally {
      document.head.innerHTML = head;
    }
  });

  test('light theme keeps the default status bar', () => {
    const head = document.head.innerHTML;
    try {
      document.head.innerHTML =
        '<meta name="theme-color" content="none"><meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">';
      applyThemeChrome('light');
      expect(meta('theme-color')).toBe(SURFACES.light.bg);
      expect(meta('apple-mobile-web-app-status-bar-style')).toBe('default');
    } finally {
      document.head.innerHTML = head;
    }
  });
});
