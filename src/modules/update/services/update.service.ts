import { check } from '@tauri-apps/plugin-updater'
import type { Update } from '@tauri-apps/plugin-updater'

/** Wrapper fino de `check()` — consulta el `latest.json` publicado en GitHub Releases. */
export async function checkForUpdate(): Promise<Update | null> {
    return check()
}
