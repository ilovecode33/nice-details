import { defineConfig } from '@rstest/core';

/** The setup file installs fake-indexeddb for the Node test environment. */
export default defineConfig({
  testEnvironment: 'node',
  setupFiles: ['./rstest.setup.ts'],
});
