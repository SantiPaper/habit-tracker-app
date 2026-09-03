/// <reference types="vite/client" />

interface ImportMetaEnv {
    /** Pisa `API_BASE_URL` — ver `.env.development`, solo activo en `tauri dev`. */
    readonly VITE_API_BASE_URL?: string
    /** Pisa `WS_URL` — ídem. */
    readonly VITE_WS_URL?: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
