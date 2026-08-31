import { useMutation, useQueryClient } from '@tanstack/react-query'

import { retireHabit } from '../services/habit.service'
import type { Habit } from '../types/habit.types'

import { habitsQueryKey } from './use-habits'

import { useToastStore } from '@/core/stores/toast-store'

interface RetireHabitInput {
    habitId: string
    fechaFin: string
    nombre: string
}

export function useRetireHabit() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ habitId, fechaFin }: RetireHabitInput) => retireHabit(habitId, fechaFin),
        onSuccess: (_result, { habitId, nombre }) => {
            queryClient.setQueryData<Habit[]>(habitsQueryKey, current =>
                current?.map(habit => (habit.id === habitId ? { ...habit, activo: false } : habit))
            )
            useToastStore.getState().addToast('success', `Hábito "${nombre}" eliminado`)
        },
        onError: (error, { nombre }) => {
            console.error('[retire-habit] failed', error)
            const message = error instanceof Error ? error.message : String(error)
            useToastStore.getState().addToast('error', `No se pudo eliminar "${nombre}": ${message}`)
        }
    })
}
