import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'

import { migrateLocalDataToCloud } from '../services/local-to-cloud-migration.service'

import { useSessionStore } from '@/modules/account/store/session-store'

/**
 * Dispara la migración local→nube una vez que hay sesión — `migrateLocalDataToCloud` ya sabe no
 * repetirse (flag en `setting`), esto solo se asegura de intentarlo una vez por montaje real (no
 * en cada re-render) y de refrescar todo lo que la UI tenga cacheado cuando termina, para que lo
 * recién migrado aparezca sin tener que reabrir la app.
 */
export function useLocalToCloudMigration() {
    const session = useSessionStore(state => state.session)
    const hydrated = useSessionStore(state => state.hydrated)
    const queryClient = useQueryClient()
    const attemptedRef = useRef(false)

    useEffect(() => {
        if (!hydrated || !session || attemptedRef.current) return
        attemptedRef.current = true

        void migrateLocalDataToCloud().then(() => {
            void queryClient.invalidateQueries()
        })
    }, [hydrated, session, queryClient])
}
