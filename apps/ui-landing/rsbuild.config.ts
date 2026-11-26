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
      '@ilovecode33/ui-tokens$': new URL(
        '../../packages/ui-tokens/src/index.ts',
        import.meta.url,
      ).pathname,
      '@ilovecode33/ui-tokens/styles.css$': new URL(
        '../../packages/ui-tokens/generated/styles.css',
        import.meta.url,
      ).pathname,
      '@ilovecode33/photo-wall$': new URL(
        '../../packages/photo-wall/src/index.ts',
        import.meta.url,
      ).pathname,
      '@ilovecode33/photo-wall/styles.css': new URL(
        '../../packages/photo-wall/src/components/PhotoWall.module.css',
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
    title: '@ilovecode33/ui · component gallery',
  },
  server: {
    port: 3200,
  },
});
