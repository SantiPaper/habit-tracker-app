import { useEffect, useRef } from 'react'

import { apiRequest } from '../services/api-client'
import { useSessionStore } from '../store/session-store'
import type { Session } from '../types/account.types'

import { useXpSummary } from '@/modules/gamification/hooks/use-xp-summary'
import { useRachaMaxima } from '@/modules/profile/hooks/use-racha-maxima'

const SYNC_INTERVAL_MS = 60_000

interface SnapshotPayload {
    nivel: number
    xpTotal: number
    rachaMaxima: number
}

/**
 * Empuja nivel/XP/racha máxima al backend (`PUT /me/snapshot`) cuando hay sesión, para que los
 * amigos vean el progreso actualizado. Mismo intervalo de chequeo que `use-habit-reminders.ts`.
 * Si no hay sesión, si falta algún dato local todavía, o si falla la red (offline, server caído),
 * no hace nada — no rompe el uso 100% local de siempre, es un agregado, no un requisito.
 */
export function useProfileSync() {
    const session = useSessionStore(state => state.session)
    const { data: xpSummary } = useXpSummary()
    const { data: rachaMaxima } = useRachaMaxima()

    const latestRef = useRef<{ session: Session | null; payload: SnapshotPayload | null }>({
        session: null,
        payload: null
    })
    latestRef.current.session = session
    latestRef.current.payload =
        xpSummary && rachaMaxima !== undefined
            ? { nivel: xpSummary.nivel, xpTotal: xpSummary.xpTotal, rachaMaxima }
            : null

    const lastSentRef = useRef<string | null>(null)

    useEffect(() => {
        async function trySync() {
            const { session, payload } = latestRef.current
            if (!session || !payload) return

            const signature = JSON.stringify(payload)
            if (signature === lastSentRef.current) return

            try {
                await apiRequest('/me/snapshot', { method: 'PUT', body: payload })
                lastSentRef.current = signature
            } catch {
                // sin conexión o el server no responde — se reintenta en el próximo tick/cambio
            }
        }

        void trySync()
        const interval = setInterval(() => void trySync(), SYNC_INTERVAL_MS)
        return () => clearInterval(interval)
    }, [session, xpSummary, rachaMaxima])
}
