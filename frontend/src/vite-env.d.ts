/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the backend API. Empty in development (Vite proxies /api). */
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}