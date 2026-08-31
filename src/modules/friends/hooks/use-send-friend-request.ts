import { useMutation } from '@tanstack/react-query'

import { sendFriendRequest } from '../services/friends-api.service'

import { useToastStore } from '@/core/stores/toast-store'

export function useSendFriendRequest() {
    return useMutation({
        mutationFn: sendFriendRequest,
        onSuccess: () => {
            useToastStore.getState().addToast('success', 'Pedido de amistad enviado')
        },
        onError: error => {
            const message = error instanceof Error ? error.message : String(error)
            useToastStore.getState().addToast('error', message)
        }
    })
}
