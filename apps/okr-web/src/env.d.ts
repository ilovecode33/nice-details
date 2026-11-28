/// <reference types="@rsbuild/core/types" />

interface ImportMetaEnv {
  readonly PUBLIC_APP_VERSION?: string;
  readonly PUBLIC_BUILD_TIME?: string;
  readonly PUBLIC_SYNC_URL?: string;
}

declare module '*.css';

declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}
