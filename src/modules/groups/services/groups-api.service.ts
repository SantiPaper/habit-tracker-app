import type { GroupDetail, GroupSummary } from '../types/groups.types'

import { apiRequest } from '@/modules/account/services/api-client'

export function listGroups() {
    return apiRequest<GroupSummary[]>('/groups')
}

export function getGroup(id: string) {
    return apiRequest<GroupDetail>(`/groups/${id}`)
}

export function createGroup(input: { name: string; memberIds: string[] }) {
    return apiRequest<GroupDetail>('/groups', { method: 'POST', body: input })
}

export function deleteGroup(id: string) {
    return apiRequest<void>(`/groups/${id}`, { method: 'DELETE' })
}

export function addGroupMember(groupId: string, memberId: string) {
    return apiRequest<{ id: string }>(`/groups/${groupId}/members`, { method: 'POST', body: { memberId } })
}

export function removeGroupMember(groupId: string, userId: string) {
    return apiRequest<void>(`/groups/${groupId}/members/${userId}`, { method: 'DELETE' })
}
