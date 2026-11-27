import { pluginReact } from '@rsbuild/plugin-react';
import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [
    {
      format: 'esm',
      dts: true,
      // Transform each module instead of bundling: component CSS Module
      // imports stay in the output, so the consumer bundles only what it uses.
      bundle: false,
    },
  ],
  plugins: [pluginReact()],
  source: {
    entry: {
      index: ['./src/**', '!src/**/*.spec.*'],
    },
  },
  output: {
    target: 'web',
    cleanDistPath: true,
  },
});
