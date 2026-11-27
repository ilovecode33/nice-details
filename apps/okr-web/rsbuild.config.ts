import { pluginReact } from '@rsbuild/plugin-react';
import { defineConfig } from '@rsbuild/core';

const relayUrl = process.env.PUBLIC_SYNC_RELAY_URL;

export default defineConfig({
  plugins: [pluginReact()],
  source: {
    entry: {
      index: './src/main.tsx',
    },
    // Per-PR previews point the app at their own signaling Worker.
    ...(relayUrl
      ? {
          define: {
            'import.meta.env.PUBLIC_SYNC_RELAY_URL': JSON.stringify(relayUrl),
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
