import { useQuery } from '@tanstack/react-query'

import { listProjectsDueInRange } from '../services/project.service'

export function projectsDueInRangeQueryKey(fromKey: string, toKey: string) {
    return ['projects', 'due-range', fromKey, toKey] as const
}

export function useProjectsDueInRange(fromKey: string, toKey: string) {
    return useQuery({
        queryKey: projectsDueInRangeQueryKey(fromKey, toKey),
        queryFn: () => listProjectsDueInRange(fromKey, toKey)
    })
}
