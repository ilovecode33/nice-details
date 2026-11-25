import { pluginReact } from '@rsbuild/plugin-react';
import { defineConfig } from '@rsbuild/core';

export default defineConfig({
  plugins: [pluginReact()],
  resolve: {
    // Keep hot reload source-only: library builds are not required in dev.
    alias: {
      '@ilovecode33/ui-core': new URL(
        '../../packages/ui-core/src/index.ts',
        import.meta.url,
      ).pathname,
      '@ilovecode33/ui-tokens': new URL(
        '../../packages/ui-tokens/src/index.ts',
        import.meta.url,
      ).pathname,
      '@ilovecode33/editor-core': new URL(
        '../../packages/editor-core/src/index.ts',
        import.meta.url,
      ).pathname,
    },
  },
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
