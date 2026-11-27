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
    title: '@ilovecode33/ui · component gallery',
  },
  server: {
    port: 3200,
  },
});
