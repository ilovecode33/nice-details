import { defineConfig } from '@rsbuild/core';

export default defineConfig({
  source: {
    entry: {
      index: './src/index.ts',
    },
  },
  html: {
    template: './src/index.html',
    title: 'ilovecode33 · blog',
  },
  server: {
    port: 3100,
  },
});
