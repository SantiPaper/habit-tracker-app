import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'

import { runSyncTick } from '../services/sync-engine'

import { useSessionStore } from '@/modules/account/store/session-store'

const FALLBACK_SYNC_INTERVAL_MS = 5 * 60_000
const MUTATION_DEBOUNCE_MS = 2000

const SYNC_AFFECTED_QUERY_KEYS = ['habits', 'daily', 'calendar', 'rollup', 'gamification', 'streak']

/**
 * Motor de sincronización de hábitos entre dispositivos, montado a nivel app. El disparo rápido
 * (WS) vive en `use-realtime.ts` — este hook cubre: sync al montar, un poll de respaldo cada 5min
 * (red de seguridad si el WS está caído/reconectando), y un disparo con debounce ante CUALQUIER
 * mutación exitosa en la app (más simple que cablear "sincronizar" a mano en cada hook de hábitos,
 * barato aunque dispare de más porque `runSyncTick` corta rápido si no hay nada para empujar).
 */
export function useSyncEngine() {
    const session = useSessionStore(state => state.session)
    const queryClient = useQueryClient()
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    async function tick() {
        await runSyncTick()
        for (const key of SYNC_AFFECTED_QUERY_KEYS) {
            queryClient.invalidateQueries({ queryKey: [key] })
        }
    }

    useEffect(() => {
        if (!session) return

        void tick()
        const interval = setInterval(() => void tick(), FALLBACK_SYNC_INTERVAL_MS)
        return () => clearInterval(interval)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session])

    useEffect(() => {
        const unsubscribe = queryClient.getMutationCache().subscribe(event => {
            if (event.type !== 'updated' || event.mutation.state.status !== 'success') return
            if (debounceRef.current) clearTimeout(debounceRef.current)
            debounceRef.current = setTimeout(() => void tick(), MUTATION_DEBOUNCE_MS)
        })

        return () => {
            unsubscribe()
            if (debounceRef.current) clearTimeout(debounceRef.current)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [queryClient])
}
