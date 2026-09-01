import { useQuery } from '@tanstack/react-query'

import { listFriendActivity } from '../services/friends-api.service'

import { useSessionStore } from '@/modules/account/store/session-store'

export function useFriendActivity() {
    const hasSession = useSessionStore(state => state.session !== null)

    return useQuery({
        queryKey: ['friends', 'activity'],
        queryFn: listFriendActivity,
        enabled: hasSession
    })
}
