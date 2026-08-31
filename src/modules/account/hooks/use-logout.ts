import { useMutation, useQueryClient } from '@tanstack/react-query'

import { clearSession } from '../services/session.service'
import { useSessionStore } from '../store/session-store'

import { useToastStore } from '@/core/stores/toast-store'
import { logoutAccount } from '@/modules/account/services/auth-api.service'

export function useLogout() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async () => {
            const session = useSessionStore.getState().session
            // La revocación en el server es best-effort — si falla (offline, token ya vencido)
            // igual se cierra la sesión local en el `finally` de abajo.
            if (session) await logoutAccount(session.refreshToken).catch(() => undefined)
        },
        onSettled: async () => {
            useSessionStore.getState().setSession(null)
            await clearSession()
            queryClient.removeQueries({ queryKey: ['friends'] })
            useToastStore.getState().addToast('success', 'Sesión cerrada')
        }
    })
}
