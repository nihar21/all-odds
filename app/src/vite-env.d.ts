/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ODDS_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare const __APP_VERSION__: string;
declare const __COMMIT_HASH__: string;
