import { useMutation, useQueryClient } from '@tanstack/react-query'

import { deleteGroup } from '../services/groups-api.service'

import { useToastStore } from '@/core/stores/toast-store'

export function useDeleteGroup() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: deleteGroup,
        onSuccess: (_data, groupId) => {
            queryClient.invalidateQueries({ queryKey: ['groups'] })
            queryClient.removeQueries({ queryKey: ['groups', groupId] })
            useToastStore.getState().addToast('success', 'Grupo eliminado')
        },
        onError: error => {
            const message = error instanceof Error ? error.message : String(error)
            useToastStore.getState().addToast('error', message)
        }
    })
}
