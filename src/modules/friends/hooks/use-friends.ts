import { useQuery } from '@tanstack/react-query'

import { listFriends } from '../services/friends-api.service'

import { useSessionStore } from '@/modules/account/store/session-store'

export function useFriends() {
    const hasSession = useSessionStore(state => state.session !== null)

    return useQuery({
        queryKey: ['friends'],
        queryFn: listFriends,
        enabled: hasSession
    })
}
