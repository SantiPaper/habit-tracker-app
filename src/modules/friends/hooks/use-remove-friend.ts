import { useMutation, useQueryClient } from '@tanstack/react-query'

import { removeFriend } from '../services/friends-api.service'

import { useToastStore } from '@/core/stores/toast-store'

export function useRemoveFriend() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: removeFriend,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['friends'] })
            useToastStore.getState().addToast('success', 'Ya no son amigos')
        },
        onError: error => {
            const message = error instanceof Error ? error.message : String(error)
            useToastStore.getState().addToast('error', message)
        }
    })
}
