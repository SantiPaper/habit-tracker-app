import type { FriendProfileSnapshot } from '@/modules/friends/types/friends.types'

export interface GroupSummary {
    id: string
    name: string
    ownerId: string
    memberCount: number
    createdAt: string
}

export interface GroupMemberProfile {
    id: string
    username: string
    profileSnapshot: FriendProfileSnapshot | null
}

export interface GroupDetail {
    id: string
    name: string
    ownerId: string
    createdAt: string
    members: GroupMemberProfile[]
}
