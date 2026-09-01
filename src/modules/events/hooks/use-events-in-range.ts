import { useQuery } from '@tanstack/react-query'

import { listEventsInRange } from '../services/event.service'

export function eventsRangeQueryKey(fromKey: string, toKey: string) {
    return ['events', 'range', fromKey, toKey] as const
}

export function useEventsInRange(fromKey: string, toKey: string) {
    return useQuery({
        queryKey: eventsRangeQueryKey(fromKey, toKey),
        queryFn: () => listEventsInRange(fromKey, toKey)
    })
}
