import { useMutation, useQueryClient } from '@tanstack/react-query'

import { upsertException } from '../services/habit-schedule-exception.service'

import { useToastStore } from '@/core/stores/toast-store'

interface UpsertExceptionInput {
    habitId: string
    fecha: string
    hora: string
    duracionMinutos: number | null
}

/** "Solo hoy" — mueve el horario de un `diario_recurrente` para una fecha puntual, sin tocar el patrón. */
export function useUpsertScheduleException() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ habitId, fecha, hora, duracionMinutos }: UpsertExceptionInput) =>
            upsertException(habitId, fecha, hora, duracionMinutos),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['schedule-exceptions'] })
            queryClient.invalidateQueries({ queryKey: ['calendar'] })
            queryClient.invalidateQueries({ queryKey: ['daily'] })
            useToastStore.getState().addToast('success', 'Horario cambiado solo por hoy')
        },
        onError: error => {
            console.error('[upsert-schedule-exception] failed', error)
            const message = error instanceof Error ? error.message : String(error)
            useToastStore.getState().addToast('error', `No se pudo cambiar el horario: ${message}`)
        }
    })
}
