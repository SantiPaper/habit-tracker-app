import { useMutation, useQueryClient } from '@tanstack/react-query'

import { splitDayIntoNewTime } from '../lib/split-schedule-block-day'
import { replaceScheduleBlocksForHabit } from '../services/habit-schedule-block.service'
import type { Habit } from '../types/habit.types'

import { habitsQueryKey } from './use-habits'

import { useToastStore } from '@/core/stores/toast-store'

interface RescheduleForeverInput {
    habit: Habit
    dayOfWeek: number
    newHora: string
}

/** "Para siempre" — separa `dayOfWeek` de cualquier bloque que lo comparta y le da su propio horario nuevo; el resto de los días del patrón queda igual. */
export function useRescheduleRecurrenteForever() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ habit, dayOfWeek, newHora }: RescheduleForeverInput) => {
            const nextBlocks = splitDayIntoNewTime(habit.scheduleBlocks, dayOfWeek, newHora)
            const rows = await replaceScheduleBlocksForHabit(habit.id, nextBlocks)
            return rows
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: habitsQueryKey })
            queryClient.invalidateQueries({ queryKey: ['calendar'] })
            queryClient.invalidateQueries({ queryKey: ['daily'] })
            useToastStore.getState().addToast('success', 'Horario actualizado')
        },
        onError: error => {
            console.error('[reschedule-recurrente-forever] failed', error)
            const message = error instanceof Error ? error.message : String(error)
            useToastStore.getState().addToast('error', `No se pudo cambiar el horario: ${message}`)
        }
    })
}
