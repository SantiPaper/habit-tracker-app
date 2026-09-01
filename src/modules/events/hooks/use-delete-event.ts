import { useMutation, useQueryClient } from '@tanstack/react-query'

import { deleteEvent } from '../services/event.service'

import { useToastStore } from '@/core/stores/toast-store'

export function useDeleteEvent() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: deleteEvent,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['events'] })
            useToastStore.getState().addToast('success', 'Evento eliminado')
        },
        onError: error => {
            console.error('[delete-event] failed', error)
            const message = error instanceof Error ? error.message : String(error)
            useToastStore.getState().addToast('error', `No se pudo eliminar el evento: ${message}`)
        }
    })
}
