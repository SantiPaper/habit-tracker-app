import { useEffect } from 'react'

import { getSession } from '../services/session.service'
import { useSessionStore } from '../store/session-store'

/** Lee la sesión guardada (si hay) al arrancar la app — hasta que termina, `hydrated` es `false` para no mostrar el login de golpe y después la sesión real. */
export function useHydrateSession() {
    useEffect(() => {
        let cancelled = false

        getSession().then(session => {
            if (cancelled) return
            useSessionStore.getState().setSession(session)
            useSessionStore.getState().setHydrated()
        })

        return () => {
            cancelled = true
        }
    }, [])
}
