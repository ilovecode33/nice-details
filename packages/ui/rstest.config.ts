import { defineConfig } from '@rstest/core';
import { withRslibConfig } from '@rstest/adapter-rslib';

/** Component tests run in a simulated DOM; the Rslib adapter supplies the React plugin and CSS Modules. */
export default defineConfig({
  extends: withRslibConfig(),
  testEnvironment: 'happy-dom',
  setupFiles: ['./rstest.setup.ts'],
});
