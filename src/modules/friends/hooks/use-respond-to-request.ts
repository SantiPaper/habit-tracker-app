import { useMutation, useQueryClient } from '@tanstack/react-query'

import { respondToFriendRequest } from '../services/friends-api.service'

import { useToastStore } from '@/core/stores/toast-store'

export function useRespondToRequest() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ friendshipId, accept }: { friendshipId: string; accept: boolean }) =>
            respondToFriendRequest(friendshipId, accept),
        onSuccess: (_data, { accept }) => {
            queryClient.invalidateQueries({ queryKey: ['friends'] })
            useToastStore.getState().addToast('success', accept ? 'Ahora son amigos' : 'Pedido rechazado')
        },
        onError: error => {
            const message = error instanceof Error ? error.message : String(error)
            useToastStore.getState().addToast('error', message)
        }
    })
}
