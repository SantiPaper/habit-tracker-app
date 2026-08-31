import { useMutation } from '@tanstack/react-query'

import { setSession } from '../services/session.service'
import { useSessionStore } from '../store/session-store'

import { useToastStore } from '@/core/stores/toast-store'
import { registerAccount } from '@/modules/account/services/auth-api.service'

export function useRegister() {
    return useMutation({
        mutationFn: registerAccount,
        onSuccess: async ({ user, accessToken, refreshToken }) => {
            const session = { accessToken, refreshToken, userId: user.id, username: user.username }
            useSessionStore.getState().setSession(session)
            await setSession(session)
            useToastStore.getState().addToast('success', `Cuenta creada — ¡bienvenido, ${user.username}!`)
        }
    })
}
