import { pluginReact } from '@rsbuild/plugin-react';
import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [
    {
      format: 'esm',
      dts: true,
    },
  ],
  plugins: [pluginReact()],
  source: {
    entry: {
      index: './src/index.ts',
    },
    exclude: ['**/__tests__/**'],
  },
  output: {
    target: 'web',
    cleanDistPath: true,
  },
});
