import { useQuery } from '@tanstack/react-query'

import { getExceptionsInRange } from '../services/habit-schedule-exception.service'

export function scheduleExceptionsRangeQueryKey(fromKey: string, toKey: string) {
    return ['schedule-exceptions', fromKey, toKey] as const
}

export function useScheduleExceptionsInRange(fromKey: string, toKey: string) {
    return useQuery({
        queryKey: scheduleExceptionsRangeQueryKey(fromKey, toKey),
        queryFn: () => getExceptionsInRange(fromKey, toKey)
    })
}
