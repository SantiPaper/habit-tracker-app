import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { deleteHabitLog, getLogByPeriod, upsertHabitLog } from '@/modules/habits/services/habit-log.service'
import type { EstadoLog, HabitLog } from '@/modules/habits/types/habit-log.types'

export function periodLogQueryKey(habitId: string, periodo: string) {
    return ['period-log', habitId, periodo] as const
}

export function usePeriodLog(habitId: string, periodo: string) {
    return useQuery({
        queryKey: periodLogQueryKey(habitId, periodo),
        queryFn: () => getLogByPeriod(habitId, periodo)
    })
}

export function useSetPeriodLog(habitId: string, periodo: string) {
    const queryClient = useQueryClient()
    const queryKey = periodLogQueryKey(habitId, periodo)

    return useMutation({
        mutationFn: async (estado: EstadoLog | null) => {
            if (estado === null) await deleteHabitLog(habitId, periodo)
            else await upsertHabitLog(habitId, periodo, estado)
        },
        onMutate: async (estado: EstadoLog | null) => {
            await queryClient.cancelQueries({ queryKey })
            const previousLog = queryClient.getQueryData<HabitLog | null>(queryKey)
            queryClient.setQueryData<HabitLog | null>(queryKey, current =>
                estado === null
                    ? null
                    : current
                      ? { ...current, estado }
                      : { id: 'optimistic', habitId, periodo, estado }
            )
            return { previousLog }
        },
        onError: (_error, _estado, context) => {
            if (context) queryClient.setQueryData(queryKey, context.previousLog)
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey })
            queryClient.invalidateQueries({ queryKey: ['gamification'] })
        }
    })
}
