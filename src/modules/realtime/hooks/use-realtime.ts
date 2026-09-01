import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'

import { connectRealtime, disconnectRealtime, type WsInboundMessage } from '../services/realtime-client'

import { useSessionStore } from '@/modules/account/store/session-store'
import { runFriendActivityTick } from '@/modules/friends/services/friend-activity-tick'
import { runSyncTick } from '@/modules/sync/services/sync-engine'

const FALLBACK_SOCIAL_INTERVAL_MS = 5 * 60_000

const HABIT_QUERY_KEYS = ['habits', 'daily', 'calendar', 'rollup', 'gamification', 'streak']

/**
 * Dueño único de la conexión WebSocket — conecta/reconecta ante cambios de `session.accessToken`
 * (login, logout, rotación de refresh), despacha cada mensaje al lado que corresponda, y corre un
 * poll de respaldo de la parte social (la de sync tiene el suyo propio en `use-sync-engine.ts`)
 * cada 5 min por si el socket está caído/reconectando (ej. Render free-tier durmiéndose).
 */
export function useRealtime() {
    const accessToken = useSessionStore(state => state.session?.accessToken)
    const queryClient = useQueryClient()

    useEffect(() => {
        if (!accessToken) {
            disconnectRealtime()
            return
        }

        function handleMessage(msg: WsInboundMessage) {
            switch (msg.type) {
                case 'friends_changed':
                case 'pending_requests_changed':
                case 'activity_feed_changed':
                    void runFriendActivityTick(queryClient)
                    break
                case 'group_changed':
                    queryClient.invalidateQueries({ queryKey: ['groups', msg.groupId] })
                    queryClient.invalidateQueries({ queryKey: ['groups'] })
                    break
                case 'habit_data_changed':
                    void runSyncTick().then(() => {
                        for (const key of HABIT_QUERY_KEYS) queryClient.invalidateQueries({ queryKey: [key] })
                    })
                    break
            }
        }

        connectRealtime(accessToken, handleMessage)
        return () => disconnectRealtime()
    }, [accessToken, queryClient])

    useEffect(() => {
        if (!accessToken) return

        const interval = setInterval(() => void runFriendActivityTick(queryClient), FALLBACK_SOCIAL_INTERVAL_MS)
        return () => clearInterval(interval)
    }, [accessToken, queryClient])
}
