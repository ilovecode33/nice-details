import { pluginReact } from '@rsbuild/plugin-react';
import { defineConfig } from '@rstest/core';

/** Tests map workspace packages to source so they run without a prior build. */
export default defineConfig({
  plugins: [pluginReact()],
  testEnvironment: 'happy-dom',
  setupFiles: ['./rstest.setup.ts'],
  resolve: {
    alias: {
      '@ilovecode33/local-sync$': new URL(
        '../../packages/local-sync/src/index.ts',
        import.meta.url,
      ).pathname,
      '@ilovecode33/okr-shared$': new URL(
        '../../packages/okr-shared/src/index.ts',
        import.meta.url,
      ).pathname,
      '@ilovecode33/persistence$': new URL(
        '../../packages/persistence/src/index.ts',
        import.meta.url,
      ).pathname,
      '@ilovecode33/ui$': new URL(
        '../../packages/ui/src/index.ts',
        import.meta.url,
      ).pathname,
      '@ilovecode33/ui-core': new URL(
        '../../packages/ui-core/src/index.ts',
        import.meta.url,
      ).pathname,
      '@ilovecode33/ui-tokens$': new URL(
        '../../packages/ui-tokens/src/index.ts',
        import.meta.url,
      ).pathname,
      '@ilovecode33/ui-types': new URL(
        '../../packages/ui-types/src/index.ts',
        import.meta.url,
      ).pathname,
    },
  },
});
