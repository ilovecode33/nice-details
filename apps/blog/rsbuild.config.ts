import { pluginReact } from '@rsbuild/plugin-react';
import { defineConfig } from '@rsbuild/core';

export default defineConfig({
  plugins: [pluginReact()],
  source: {
    entry: {
      index: './src/main.tsx',
    },
  },
  html: {
    template: './src/index.html',
    title: 'ilovecode33 · blog',
  },
  server: {
    port: 3100,
    // Serve index.html for /about and any future client-side route.
    historyApiFallback: true,
  },
});
