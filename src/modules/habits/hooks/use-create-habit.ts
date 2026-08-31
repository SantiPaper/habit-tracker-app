import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createHabit } from '../services/habit.service'
import type { Habit } from '../types/habit.types'

import { habitsQueryKey } from './use-habits'

import { useToastStore } from '@/core/stores/toast-store'

export function useCreateHabit() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: createHabit,
        onSuccess: newHabit => {
            queryClient.setQueryData<Habit[]>(habitsQueryKey, current =>
                current ? [...current, newHabit] : [newHabit]
            )
            useToastStore.getState().addToast('success', `Hábito "${newHabit.nombre}" creado`)
        },
        onError: error => {
            console.error('[create-habit] failed', error)
            const message = error instanceof Error ? error.message : String(error)
            useToastStore.getState().addToast('error', `No se pudo crear el hábito: ${message}`)
        }
    })
}
