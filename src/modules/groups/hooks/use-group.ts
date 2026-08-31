import { useQuery } from '@tanstack/react-query'

import { getGroup } from '../services/groups-api.service'

import { useSessionStore } from '@/modules/account/store/session-store'

export function useGroup(groupId: string | null) {
    const hasSession = useSessionStore(state => state.session !== null)

    return useQuery({
        queryKey: ['groups', groupId],
        queryFn: () => getGroup(groupId!),
        enabled: hasSession && !!groupId
    })
}
