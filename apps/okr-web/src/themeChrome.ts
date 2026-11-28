import { SURFACES } from '@ilovecode33/ui-tokens';

/**
 * Paints the browser chrome with the app background for the resolved theme.
 * `theme-color` drives Android status bars and browser UI; on iOS
 * `black-translucent` lets the dark app background show through the standalone
 * status bar. Light mode keeps the default (dark-on-light) status bar, where a
 * translucent bar would make the white system text unreadable.
 */
export function applyThemeChrome(resolved: 'light' | 'dark'): void {
  const background = SURFACES[resolved].bg;
  document.documentElement.style.backgroundColor = background;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', background);
  document
    .querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')
    ?.setAttribute('content', resolved === 'dark' ? 'black-translucent' : 'default');
}
