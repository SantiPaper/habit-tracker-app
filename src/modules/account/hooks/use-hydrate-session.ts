import { useEffect } from 'react'

import { getSession } from '../services/session.service'
import { useSessionStore } from '../store/session-store'

/**
 * Lee la sesión guardada (si hay) al arrancar la app — hasta que termina, `hydrated` es `false`
 * para no mostrar el login de golpe y después la sesión real. `setHydrated()` corre en un
 * `finally` a propósito: si `getSession()` falla (ej. la DB todavía no está lista), la pantalla
 * de "Amigos" no debe quedar en "Cargando..." para siempre — se degrada a sin sesión.
 */
export function useHydrateSession() {
    useEffect(() => {
        let cancelled = false

        getSession()
            .then(session => {
                if (!cancelled) useSessionStore.getState().setSession(session)
            })
            .catch(() => {
                if (!cancelled) useSessionStore.getState().setSession(null)
            })
            .finally(() => {
                if (!cancelled) useSessionStore.getState().setHydrated()
            })

        return () => {
            cancelled = true
        }
    }, [])
}
