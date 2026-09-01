import type { QueryClient } from '@tanstack/react-query'
import { isPermissionGranted, sendNotification } from '@tauri-apps/plugin-notification'

import { checkNewActivity, checkNewPendingRequests, formatActivityMessage } from '../lib/friend-activity'

import { listFriendActivity, listFriends, listPendingRequests } from './friends-api.service'

import { useToastStore } from '@/core/stores/toast-store'
import { useSessionStore } from '@/modules/account/store/session-store'

/**
 * Función plana (no hook) — llamada tanto por el disparo instantáneo del WebSocket
 * (`use-realtime.ts`, ante `friends_changed`/`pending_requests_changed`/`activity_feed_changed`)
 * como por su poll de respaldo. Trae amigos+pendientes+actividad, ceba la cache de React Query, y
 * corre la detección pura de `friend-activity.ts` para avisar (toast + notificación nativa para
 * pedidos nuevos).
 */
export async function runFriendActivityTick(queryClient: QueryClient): Promise<void> {
    const session = useSessionStore.getState().session
    if (!session) return

    try {
        const [friends, activity] = await Promise.all([listFriends(), listFriendActivity()])
        queryClient.setQueryData(['friends'], friends)
        queryClient.setQueryData(['friends', 'activity'], activity)

        for (const event of checkNewActivity(activity)) {
            useToastStore.getState().addToast('success', formatActivityMessage(event))
        }

        const pending = await listPendingRequests()
        queryClient.setQueryData(['friends', 'pending'], pending)
        const newRequestMessages = checkNewPendingRequests(pending)
        if (newRequestMessages.length > 0) {
            for (const message of newRequestMessages) useToastStore.getState().addToast('success', message)

            // Notificación nativa también acá (a diferencia de subida de nivel/racha, que solo son
            // toast) — un pedido de amistad es más "accionable", vale la pena que se vea aunque la
            // app esté minimizada, igual que los recordatorios de hábitos.
            if (await isPermissionGranted()) {
                for (const message of newRequestMessages) {
                    void sendNotification({ title: 'Habit Tracker', body: message })
                }
            }
        }
    } catch {
        // sin conexión o el server no responde — se reintenta en el próximo tick
    }
}
