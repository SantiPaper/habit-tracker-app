import { apiRequest } from '@/modules/account/services/api-client'

export interface ApiScheduleException {
    id: string
    habitId: string
    fecha: string
    hora: string
    duracionMinutos: number | null
    createdAt: string
    updatedAt: string
}

export function apiListExceptions(from: string, to: string) {
    return apiRequest<ApiScheduleException[]>('/habits/schedule-exceptions', { query: { from, to } })
}

export function apiUpsertException(habitId: string, fecha: string, hora: string, duracionMinutos: number | null) {
    return apiRequest<ApiScheduleException>(`/habits/${habitId}/schedule-exceptions/${fecha}`, {
        method: 'PUT',
        body: { hora, duracionMinutos }
    })
}
