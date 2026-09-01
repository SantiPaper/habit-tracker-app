import { useQuery } from '@tanstack/react-query'

import { getEventsForDate } from '../services/event.service'

import { toDateKey } from '@/lib/date/period'

export function eventsForDateQueryKey(dateKey: string) {
    return ['events', 'date', dateKey] as const
}

export function useEventsForDate(date: Date) {
    const dateKey = toDateKey(date)

    return useQuery({
        queryKey: eventsForDateQueryKey(dateKey),
        queryFn: () => getEventsForDate(dateKey)
    })
}
