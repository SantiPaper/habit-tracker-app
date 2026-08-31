import { useQuery } from '@tanstack/react-query'

import { getSettings } from '../services/settings.service'

export const settingsQueryKey = ['settings'] as const

export function useSettings() {
    return useQuery({
        queryKey: settingsQueryKey,
        queryFn: getSettings
    })
}
