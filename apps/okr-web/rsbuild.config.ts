import { pluginReact } from '@rsbuild/plugin-react';
import { defineConfig } from '@rsbuild/core';
import { readFileSync } from 'node:fs';
import { SURFACES } from '@ilovecode33/ui-tokens';

const syncUrl = process.env.PUBLIC_SYNC_URL;
const buildTime = new Date().toISOString();
const { version } = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf8'),
) as { version: string };

// Runs before first paint so a standalone window opens with the saved theme's
// background instead of a white status bar. The colors come from the tokens.
const themeChromeScript = `(function(){try{
  var saved=localStorage.getItem('gallery.theme')||'system';
  var dark=saved==='dark'||(saved!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);
  var bg=dark?${JSON.stringify(SURFACES.dark.bg)}:${JSON.stringify(SURFACES.light.bg)};
  var meta=document.querySelector('meta[name="theme-color"]');
  if(meta)meta.setAttribute('content',bg);
  var status=document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
  if(status)status.setAttribute('content',dark?'black-translucent':'default');
  document.documentElement.style.backgroundColor=bg;
}catch(e){}})();`;

export default defineConfig({
  plugins: [pluginReact()],
  source: {
    entry: {
      index: './src/main.tsx',
    },
    define: {
      'import.meta.env.PUBLIC_APP_VERSION': JSON.stringify(version),
      'import.meta.env.PUBLIC_BUILD_TIME': JSON.stringify(buildTime),
      // Local or alternate realtime Worker during development.
      ...(syncUrl
        ? { 'import.meta.env.PUBLIC_SYNC_URL': JSON.stringify(syncUrl) }
        : {}),
    },
  },
  html: {
    template: './src/index.html',
    title: 'My OKRs',
    tags: [
      {
        tag: 'meta',
        attrs: { name: 'app-version', content: version },
        head: true,
      },
      {
        tag: 'meta',
        attrs: { name: 'theme-color', content: SURFACES.light.bg },
        head: true,
      },
      {
        tag: 'meta',
        attrs: {
          name: 'apple-mobile-web-app-status-bar-style',
          content: 'default',
        },
        head: true,
      },
      {
        tag: 'script',
        children: themeChromeScript,
        head: true,
      },
    ],
  },
  server: {
    port: 3201,
  },
});
