import { useMutation, useQueryClient } from '@tanstack/react-query'

import { updateHabitDetails } from '../services/habit.service'
import type { Habit } from '../types/habit.types'

import { habitsQueryKey } from './use-habits'

import { useToastStore } from '@/core/stores/toast-store'

interface RescheduleUnicoInput {
    habit: Habit
    newHora: string
}

/** Arrastrar un `diario_unico` — no hay patrón que separar, se cambia la hora directo. */
export function useRescheduleUnico() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ habit, newHora }: RescheduleUnicoInput) =>
            updateHabitDetails(habit.id, {
                nombre: habit.nombre,
                fecha: habit.fecha,
                hora: newHora,
                duracionMinutos: habit.duracionMinutos,
                color: habit.color,
                importancia: habit.importancia
            }),
        onSuccess: updated => {
            queryClient.setQueryData<Habit[]>(habitsQueryKey, current =>
                current?.map(h => (h.id === updated.id ? updated : h))
            )
            queryClient.invalidateQueries({ queryKey: ['calendar'] })
            queryClient.invalidateQueries({ queryKey: ['daily'] })
            useToastStore.getState().addToast('success', 'Horario actualizado')
        },
        onError: error => {
            console.error('[reschedule-unico] failed', error)
            const message = error instanceof Error ? error.message : String(error)
            useToastStore.getState().addToast('error', `No se pudo cambiar el horario: ${message}`)
        }
    })
}
