import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';

declare module '@rstest/core' {
  interface Assertion<T = any> extends TestingLibraryMatchers<T, void> {}
  interface Matchers<R, T = {}> extends TestingLibraryMatchers<T, R> {}
}
