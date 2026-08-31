import { useMutation, useQueryClient } from '@tanstack/react-query'

import { removeGroupMember } from '../services/groups-api.service'

import { useToastStore } from '@/core/stores/toast-store'

export function useRemoveGroupMember() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ groupId, userId }: { groupId: string; userId: string }) => removeGroupMember(groupId, userId),
        onSuccess: (_data, { groupId }) => {
            queryClient.invalidateQueries({ queryKey: ['groups', groupId] })
            queryClient.invalidateQueries({ queryKey: ['groups'] })
            useToastStore.getState().addToast('success', 'Listo')
        },
        onError: error => {
            const message = error instanceof Error ? error.message : String(error)
            useToastStore.getState().addToast('error', message)
        }
    })
}
