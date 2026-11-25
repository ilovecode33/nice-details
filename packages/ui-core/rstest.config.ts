import { defineConfig } from '@rstest/core';

/** Pure contract tests — no DOM or React renderer needed. */
export default defineConfig({
  testEnvironment: 'node',
});
