import type { FriendProfileSnapshot } from '@/modules/friends/types/friends.types'

export interface LeaderboardEntry {
    id: string
    username: string
    profileSnapshot: FriendProfileSnapshot | null
    isSelf: boolean
}

export type LeaderboardMetric = 'nivel' | 'xpTotal' | 'rachaMaxima'
