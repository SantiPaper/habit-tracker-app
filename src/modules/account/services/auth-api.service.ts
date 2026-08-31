import { apiRequest } from './api-client'

import type { AccountUser } from '@/modules/account/types/account.types'

interface AuthResponse {
    user: AccountUser
    accessToken: string
    refreshToken: string
}

export function registerAccount(input: { username: string; email: string; password: string }) {
    return apiRequest<AuthResponse>('/auth/register', { method: 'POST', body: input })
}

export function loginAccount(input: { identifier: string; password: string }) {
    return apiRequest<AuthResponse>('/auth/login', { method: 'POST', body: input })
}

export function logoutAccount(refreshToken: string) {
    return apiRequest<{ message: string }>('/auth/logout', { method: 'POST', body: { refreshToken } })
}
