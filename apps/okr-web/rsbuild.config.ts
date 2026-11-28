import { pluginReact } from '@rsbuild/plugin-react';
import { defineConfig } from '@rsbuild/core';

const syncUrl = process.env.PUBLIC_SYNC_URL;

export default defineConfig({
  plugins: [pluginReact()],
  source: {
    entry: {
      index: './src/main.tsx',
    },
    // Local or alternate realtime Worker during development.
    ...(syncUrl
      ? {
          define: {
            'import.meta.env.PUBLIC_SYNC_URL': JSON.stringify(syncUrl),
          },
        }
      : {}),
  },
  html: {
    template: './src/index.html',
    title: 'My OKRs',
  },
  server: {
    port: 3201,
  },
});
