import { useQuery } from '@tanstack/react-query'

import { listGroups } from '../services/groups-api.service'

import { useSessionStore } from '@/modules/account/store/session-store'

export function useGroups() {
    const hasSession = useSessionStore(state => state.session !== null)

    return useQuery({
        queryKey: ['groups'],
        queryFn: listGroups,
        enabled: hasSession
    })
}
