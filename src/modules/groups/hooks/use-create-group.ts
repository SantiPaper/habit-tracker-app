import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createGroup } from '../services/groups-api.service'

import { useToastStore } from '@/core/stores/toast-store'

export function useCreateGroup() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: createGroup,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['groups'] })
            useToastStore.getState().addToast('success', 'Grupo creado')
        },
        onError: error => {
            const message = error instanceof Error ? error.message : String(error)
            useToastStore.getState().addToast('error', message)
        }
    })
}
