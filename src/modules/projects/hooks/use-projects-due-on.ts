import { useQuery } from '@tanstack/react-query'

import { getProjectsDueOn } from '../services/project.service'

import { toDateKey } from '@/lib/date/period'

export function projectsDueOnQueryKey(dateKey: string) {
    return ['projects', 'due-on', dateKey] as const
}

export function useProjectsDueOn(date: Date) {
    const dateKey = toDateKey(date)

    return useQuery({
        queryKey: projectsDueOnQueryKey(dateKey),
        queryFn: () => getProjectsDueOn(dateKey)
    })
}
