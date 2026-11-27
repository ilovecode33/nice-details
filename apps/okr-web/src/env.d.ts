/// <reference types="@rsbuild/core/types" />

interface ImportMetaEnv {
  readonly PUBLIC_SYNC_RELAY_URL?: string;
}

declare module '*.css';

declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}
