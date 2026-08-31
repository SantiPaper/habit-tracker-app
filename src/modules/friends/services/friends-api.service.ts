import { apiRequest } from '@/modules/account/services/api-client'
import type { Friend, PendingFriendRequest, UserSearchResult } from '@/modules/friends/types/friends.types'

export function searchUsers(query: string) {
    return apiRequest<UserSearchResult[]>('/friends/search', { query: { q: query } })
}

export function sendFriendRequest(addresseeId: string) {
    return apiRequest<{ id: string }>('/friends/requests', { method: 'POST', body: { addresseeId } })
}

export function listPendingRequests() {
    return apiRequest<PendingFriendRequest[]>('/friends/requests')
}

export function respondToFriendRequest(friendshipId: string, accept: boolean) {
    return apiRequest<{ id: string }>(`/friends/requests/${friendshipId}/${accept ? 'accept' : 'decline'}`, {
        method: 'POST'
    })
}

export function listFriends() {
    return apiRequest<Friend[]>('/friends')
}

export function removeFriend(friendshipId: string) {
    return apiRequest<void>(`/friends/${friendshipId}`, { method: 'DELETE' })
}
