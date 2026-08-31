import type { LocalChanges, RemoteChanges } from './local-sync-queries'

import { apiRequest } from '@/modules/account/services/api-client'

export function pushChanges(payload: LocalChanges) {
    return apiRequest<{ applied: boolean }>('/sync/push', { method: 'POST', body: payload })
}

export function pullChanges(since: string | null) {
    return apiRequest<RemoteChanges & { syncedAt: string }>('/sync/pull', {
        query: since ? { since } : undefined
    })
}
