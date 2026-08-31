import {
    getLocalChangesSince,
    hasLocalChanges,
    setSyncCursor,
    applyRemoteChanges,
    getSyncCursor
} from './local-sync-queries'
import { pullChanges, pushChanges } from './sync-api.service'

import { useSessionStore } from '@/modules/account/store/session-store'

let syncing = false

/**
 * Una ronda completa de sync: push de lo local nuevo → pull de lo remoto nuevo → aplica → avanza
 * el cursor al valor que devuelve el SERVER (no el reloj local, para no depender de que los relojes
 * de los dos dispositivos estén sincronizados entre sí). Guardia `syncing` simple para no correr
 * dos rondas superpuestas si el WS y el poll de respaldo disparan casi al mismo tiempo.
 */
export async function runSyncTick(): Promise<void> {
    if (syncing) return
    const session = useSessionStore.getState().session
    if (!session) return

    syncing = true
    try {
        const cursor = await getSyncCursor()

        const localChanges = await getLocalChangesSince(cursor)
        if (hasLocalChanges(localChanges)) {
            await pushChanges(localChanges)
        }

        const remote = await pullChanges(cursor)
        await applyRemoteChanges(remote)
        await setSyncCursor(remote.syncedAt)
    } catch {
        // sin conexión, servidor caído, etc. — se reintenta en el próximo tick
    } finally {
        syncing = false
    }
}
