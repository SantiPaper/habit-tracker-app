import { useMutation, useQueryClient } from '@tanstack/react-query'

import { updateEvent, type UpdateEventInput } from '../services/event.service'

import { useToastStore } from '@/core/stores/toast-store'

export function useUpdateEvent() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ eventId, input }: { eventId: string; input: UpdateEventInput }) => updateEvent(eventId, input),
        onSuccess: updated => {
            queryClient.invalidateQueries({ queryKey: ['events'] })
            useToastStore.getState().addToast('success', `Evento "${updated.nombre}" actualizado`)
        },
        onError: error => {
            console.error('[update-event] failed', error)
            const message = error instanceof Error ? error.message : String(error)
            useToastStore.getState().addToast('error', `No se pudo actualizar el evento: ${message}`)
        }
    })
}
