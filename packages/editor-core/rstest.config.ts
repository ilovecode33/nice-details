import { defineConfig } from '@rstest/core';

/** Lexical needs a DOM, so run the editor contract tests in happy-dom. */
export default defineConfig({
  testEnvironment: 'happy-dom',
});
