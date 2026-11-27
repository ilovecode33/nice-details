import { pluginReact } from '@rsbuild/plugin-react';
import { defineConfig } from '@rstest/core';

export default defineConfig({
  plugins: [pluginReact()],
  testEnvironment: 'happy-dom',
  setupFiles: ['./rstest.setup.ts'],
  resolve: {
    alias: {
      '@ilovecode33/persistence$': new URL(
        '../../packages/persistence/src/index.ts',
        import.meta.url,
      ).pathname,
    },
  },
});
