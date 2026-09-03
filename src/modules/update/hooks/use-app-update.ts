import { relaunch } from '@tauri-apps/plugin-process'
import type { Update } from '@tauri-apps/plugin-updater'
import { useEffect, useRef, useState } from 'react'

import { checkForUpdate } from '../services/update.service'

const UPDATE_CHECK_INTERVAL_MS = 3 * 60 * 60 * 1000

/**
 * Chequea actualizaciones al montar (app-level, en `App.tsx`) y cada 3hs mientras la app queda
 * abierta — mismo esqueleto de `setInterval` que `use-profile-sync.ts`/`use-habit-reminders.ts`,
 * mucho más espaciado porque no tiene sentido pegarle a GitHub cada 60s por esto. Silencioso ante
 * cualquier falla (sin conexión, GitHub caído) — nunca rompe el uso normal de la app.
 *
 * En `tauri dev` (`import.meta.env.DEV`) no corre nada — la ventana de testeo corre el código más
 * nuevo por definición, avisar "hay una actualización" ahí es ruido/confuso sin sentido, y encima
 * dispararía un `downloadAndInstall()` real contra el último release de GitHub si se tocara el
 * botón (nada que ver con lo que se está probando).
 */
export function useAppUpdate() {
    const [available, setAvailable] = useState(false)
    const [version, setVersion] = useState<string | null>(null)
    const [notes, setNotes] = useState<string | null>(null)
    const [installing, setInstalling] = useState(false)
    const updateRef = useRef<Update | null>(null)

    useEffect(() => {
        if (import.meta.env.DEV) return
        let cancelled = false

        async function runCheck() {
            try {
                const update = await checkForUpdate()
                if (cancelled) return
                updateRef.current = update
                setAvailable(update !== null)
                setVersion(update?.version ?? null)
                setNotes(update?.body ?? null)
            } catch {
                // sin conexión o falló el chequeo — se reintenta en el próximo tick
            }
        }

        void runCheck()
        const interval = setInterval(() => void runCheck(), UPDATE_CHECK_INTERVAL_MS)
        return () => {
            cancelled = true
            clearInterval(interval)
        }
    }, [])

    async function install() {
        const update = updateRef.current
        if (!update || installing) return
        setInstalling(true)
        try {
            await update.downloadAndInstall()
            await relaunch()
        } catch {
            setInstalling(false)
        }
    }

    return { available, version, notes, installing, install }
}
