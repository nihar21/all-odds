/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ODDS_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
