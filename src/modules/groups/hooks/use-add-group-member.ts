import { useMutation, useQueryClient } from '@tanstack/react-query'

import { addGroupMember } from '../services/groups-api.service'

import { useToastStore } from '@/core/stores/toast-store'

export function useAddGroupMember() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ groupId, memberId }: { groupId: string; memberId: string }) => addGroupMember(groupId, memberId),
        onSuccess: (_data, { groupId }) => {
            queryClient.invalidateQueries({ queryKey: ['groups', groupId] })
            queryClient.invalidateQueries({ queryKey: ['groups'] })
            useToastStore.getState().addToast('success', 'Miembro agregado')
        },
        onError: error => {
            const message = error instanceof Error ? error.message : String(error)
            useToastStore.getState().addToast('error', message)
        }
    })
}
