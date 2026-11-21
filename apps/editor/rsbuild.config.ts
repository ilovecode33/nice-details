import { defineConfig } from '@rsbuild/core';

export default defineConfig({
  source: {
    entry: {
      index: './src/index.ts',
    },
  },
  html: {
    template: './src/index.html',
    title: 'nice-details · WYSIWYG Editor',
  },
  server: {
    port: 3000,
  },
});
