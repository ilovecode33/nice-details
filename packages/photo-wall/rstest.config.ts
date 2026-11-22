import { defineConfig } from '@rstest/core';
import { withRslibConfig } from '@rstest/adapter-rslib';

/** Pure algorithm tests; the Rslib adapter supplies the React plugin and CSS Modules. */
export default defineConfig({
  extends: withRslibConfig(),
});
