/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_URL?: string;
    readonly VITE_STORAGE_URL?: string;
    readonly VITE_TOKEN_KEY?: string;
    readonly VITE_EDITOR_API_KEY?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
