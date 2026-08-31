import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'

import { checkNewPendingRequests, checkNivelUp, checkRachaOvertake } from '../lib/friend-activity'
import { listFriends, listPendingRequests } from '../services/friends-api.service'

import { useToastStore } from '@/core/stores/toast-store'
import { useSessionStore } from '@/modules/account/store/session-store'
import type { Session } from '@/modules/account/types/account.types'
import { useRachaMaxima } from '@/modules/profile/hooks/use-racha-maxima'

const WATCH_INTERVAL_MS = 60_000

/**
 * App-level (montado en `App.tsx`, NO depende de que la pestaña Amigos esté abierta) — detecta
 * "tu amigo subió de nivel" / "te superó en racha" / "te llegó una solicitud nueva" comparando
 * contra lo último visto (`friend-activity.ts`, localStorage). Mismo esqueleto que
 * `use-profile-sync.ts`: corre una vez al montar + cada 60s, silencioso ante cualquier falla.
 */
export function useFriendActivityWatcher() {
    const session = useSessionStore(state => state.session)
    const { data: myRachaMaxima } = useRachaMaxima()
    const queryClient = useQueryClient()

    const latestRef = useRef<{ session: Session | null; myRachaMaxima: number | undefined }>({
        session: null,
        myRachaMaxima: undefined
    })
    latestRef.current.session = session
    latestRef.current.myRachaMaxima = myRachaMaxima

    useEffect(() => {
        async function tick() {
            const { session, myRachaMaxima } = latestRef.current
            if (!session) return

            try {
                const friends = await listFriends()
                queryClient.setQueryData(['friends'], friends)

                for (const friend of friends) {
                    if (!friend.profileSnapshot) continue

                    const nivelMessage = checkNivelUp(
                        friend.friendshipId,
                        friend.username,
                        friend.profileSnapshot.nivel
                    )
                    if (nivelMessage) useToastStore.getState().addToast('success', nivelMessage)

                    if (myRachaMaxima !== undefined) {
                        const rachaMessage = checkRachaOvertake(
                            friend.friendshipId,
                            friend.username,
                            myRachaMaxima,
                            friend.profileSnapshot.rachaMaxima
                        )
                        if (rachaMessage) useToastStore.getState().addToast('success', rachaMessage)
                    }
                }

                const pending = await listPendingRequests()
                queryClient.setQueryData(['friends', 'pending'], pending)
                for (const message of checkNewPendingRequests(pending)) {
                    useToastStore.getState().addToast('success', message)
                }
            } catch {
                // sin conexión o el server no responde — se reintenta en el próximo tick
            }
        }

        void tick()
        const interval = setInterval(() => void tick(), WATCH_INTERVAL_MS)
        return () => clearInterval(interval)
    }, [queryClient])
}
