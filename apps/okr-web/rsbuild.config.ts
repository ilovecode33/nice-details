import { pluginReact } from '@rsbuild/plugin-react';
import { defineConfig } from '@rsbuild/core';
import { readFileSync } from 'node:fs';

const syncUrl = process.env.PUBLIC_SYNC_URL;
const { version } = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf8'),
) as { version: string };

export default defineConfig({
  plugins: [pluginReact()],
  source: {
    entry: {
      index: './src/main.tsx',
    },
    define: {
      'import.meta.env.PUBLIC_APP_VERSION': JSON.stringify(version),
      // Local or alternate realtime Worker during development.
      ...(syncUrl
        ? { 'import.meta.env.PUBLIC_SYNC_URL': JSON.stringify(syncUrl) }
        : {}),
    },
  },
  html: {
    template: './src/index.html',
    title: 'My OKRs',
  },
  server: {
    port: 3201,
  },
});
