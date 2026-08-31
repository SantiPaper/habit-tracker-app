export interface FriendProfileSnapshot {
    nivel: number
    xpTotal: number
    rachaMaxima: number
    updatedAt: string
}

export interface Friend {
    friendshipId: string
    id: string
    username: string
    profileSnapshot: FriendProfileSnapshot | null
}

export interface PendingFriendRequest {
    friendshipId: string
    from: { id: string; username: string }
    createdAt: string
}

export interface UserSearchResult {
    id: string
    username: string
}
