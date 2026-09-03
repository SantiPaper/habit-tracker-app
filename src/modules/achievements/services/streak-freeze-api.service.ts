import { apiRequest } from '@/modules/account/services/api-client'

export interface ApiStreakFreeze {
    id: string
    habitId: string
    milestoneRacha: number
    earnedAt: string
    consumedPeriodo: string | null
    consumedAt: string | null
}

export function apiListStreakFreezes(habitId: string) {
    return apiRequest<ApiStreakFreeze[]>(`/habits/${habitId}/streak-freezes`)
}

export function apiEarnStreakFreeze(habitId: string, milestoneRacha: number) {
    return apiRequest<ApiStreakFreeze>(`/habits/${habitId}/streak-freezes`, {
        method: 'POST',
        body: { milestoneRacha }
    })
}

export function apiConsumeStreakFreeze(habitId: string, freezeId: string, consumedPeriodo: string) {
    return apiRequest<ApiStreakFreeze>(`/habits/${habitId}/streak-freezes/${freezeId}`, {
        method: 'PATCH',
        body: { consumedPeriodo }
    })
}
