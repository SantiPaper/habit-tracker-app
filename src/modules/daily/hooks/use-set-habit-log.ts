import { useMutation, useQueryClient } from '@tanstack/react-query'

import { deleteHabitLog, upsertHabitLog } from '../../habits/services/habit-log.service'
import type { EstadoLog } from '../../habits/types/habit-log.types'

import { habitsForDateQueryKey, type HabitOnDateItem } from './use-habits-for-date'

interface SetHabitLogInput {
    habitId: string
    /** `null` = volver a "sin marcar" (borra el log). */
    estado: EstadoLog | null
}

export function useSetHabitLog(dateKey: string) {
    const queryClient = useQueryClient()
    const queryKey = habitsForDateQueryKey(dateKey)

    return useMutation({
        mutationFn: async ({ habitId, estado }: SetHabitLogInput) => {
            if (estado === null) await deleteHabitLog(habitId, dateKey)
            else await upsertHabitLog(habitId, dateKey, estado)
        },
        onMutate: async ({ habitId, estado }: SetHabitLogInput) => {
            await queryClient.cancelQueries({ queryKey })
            const previousItems = queryClient.getQueryData<HabitOnDateItem[]>(queryKey)

            queryClient.setQueryData<HabitOnDateItem[]>(queryKey, current =>
                current?.map(item => (item.habit.id === habitId ? { ...item, estado } : item))
            )

            return { previousItems }
        },
        onError: (_error, _input, context) => {
            if (context?.previousItems) {
                queryClient.setQueryData(queryKey, context.previousItems)
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey })
            queryClient.invalidateQueries({ queryKey: ['calendar'] })
            queryClient.invalidateQueries({ queryKey: ['rollup'] })
            queryClient.invalidateQueries({ queryKey: ['gamification'] })
            queryClient.invalidateQueries({ queryKey: ['streak'] })
        }
    })
}
