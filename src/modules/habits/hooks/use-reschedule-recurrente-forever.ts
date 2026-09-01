import { useMutation, useQueryClient } from '@tanstack/react-query'

import { splitDayIntoNewTime } from '../lib/split-schedule-block-day'
import { replaceScheduleBlocksForHabit } from '../services/habit-schedule-block.service'
import type { Habit } from '../types/habit.types'

import { habitsQueryKey } from './use-habits'

import { useToastStore } from '@/core/stores/toast-store'

interface RescheduleForeverInput {
    habit: Habit
    /** El bloque EXACTO que se arrastró — necesario cuando el hábito tiene más de un bloque el mismo día (ver `splitDayIntoNewTime`). `null` si se arrastró un día ya cubierto por una excepción puntual (caso raro, no rompe nada — solo agrega el horario nuevo sin poder identificar cuál bloque de origen tocar). */
    blockId: string | null
    dayOfWeek: number
    newHora: string
}

/** "Para siempre" — separa `dayOfWeek` del bloque arrastrado (no de cualquiera que lo comparta) y le da su propio horario nuevo; el resto de los bloques del patrón queda intacto. */
export function useRescheduleRecurrenteForever() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ habit, blockId, dayOfWeek, newHora }: RescheduleForeverInput) => {
            const nextBlocks = splitDayIntoNewTime(habit.scheduleBlocks, blockId, dayOfWeek, newHora)
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
