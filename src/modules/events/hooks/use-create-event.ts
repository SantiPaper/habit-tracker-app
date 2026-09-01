import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createEvent } from '../services/event.service'

import { useToastStore } from '@/core/stores/toast-store'

export function useCreateEvent() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: createEvent,
        onSuccess: newEvent => {
            queryClient.invalidateQueries({ queryKey: ['events'] })
            useToastStore.getState().addToast('success', `Evento "${newEvent.nombre}" creado`)
        },
        onError: error => {
            console.error('[create-event] failed', error)
            const message = error instanceof Error ? error.message : String(error)
            useToastStore.getState().addToast('error', `No se pudo crear el evento: ${message}`)
        }
    })
}
