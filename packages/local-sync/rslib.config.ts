import { pluginReact } from '@rsbuild/plugin-react';
import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [
    {
      format: 'esm',
      dts: true,
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
