import { useQuery } from '@tanstack/react-query'

import { listPendingRequests } from '../services/friends-api.service'

import { useSessionStore } from '@/modules/account/store/session-store'

export function usePendingRequests() {
    const hasSession = useSessionStore(state => state.session !== null)

    return useQuery({
        queryKey: ['friends', 'pending'],
        queryFn: listPendingRequests,
        enabled: hasSession
    })
}
