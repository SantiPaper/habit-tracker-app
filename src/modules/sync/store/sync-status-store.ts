import { create } from 'zustand'

const LAST_SYNCED_KEY = 'sync-last-succeeded-at'

/** Igual patrón manual que `friend-activity.ts` — un solo string, no vale la pena traer el middleware `persist` de zustand para esto. */
function readPersistedLastSyncedAt(): string | null {
    try {
        return localStorage.getItem(LAST_SYNCED_KEY)
    } catch {
        return null
    }
}

interface SyncStatusState {
    /** ISO de la última vez que `runSyncTick` completó sin tirar — persistido, así sigue siendo preciso aunque se haya cerrado la app entremedio. */
    lastSyncedAt: string | null
    /** Motivo del último intento fallido — se limpia solo en el próximo éxito, nunca se persiste (es diagnóstico de "ahora", no historial). */
    lastErrorMessage: string | null
    setSuccess: () => void
    setError: (message: string) => void
}

/**
 * Estado global de sincronización — hasta ahora `runSyncTick` fallaba en silencio (`catch {}`
 * vacío en `sync-engine.ts`), así que un corte prolongado (servidor caído, token roto, lo que sea)
 * era invisible salvo que se notara el síntoma (datos viejos). Esto le da un lugar a la UI para
 * avisar "hace cuánto que no sincroniza" en vez de asumir que siempre está al día.
 */
export const useSyncStatusStore = create<SyncStatusState>(set => ({
    lastSyncedAt: readPersistedLastSyncedAt(),
    lastErrorMessage: null,
    setSuccess: () => {
        const iso = new Date().toISOString()
        try {
            localStorage.setItem(LAST_SYNCED_KEY, iso)
        } catch {
            /* no-op */
        }
        set({ lastSyncedAt: iso, lastErrorMessage: null })
    },
    setError: message => set({ lastErrorMessage: message })
}))
