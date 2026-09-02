import { apiRequest } from '@/modules/account/services/api-client'
import type { EstadoLog } from '@/modules/habits/types/habit-log.types'

export interface ApiHabitLog {
    id: string
    habitId: string
    userId: string
    periodo: string
    estado: EstadoLog
    createdAt: string
    updatedAt: string
}

export interface ListLogsFilter {
    habitId?: string
    periodo?: string
    from?: string
    to?: string
}

export function apiListLogs(filter: ListLogsFilter = {}) {
    const query: Record<string, string> = {}
    if (filter.habitId) query.habitId = filter.habitId
    if (filter.periodo) query.periodo = filter.periodo
    if (filter.from) query.from = filter.from
    if (filter.to) query.to = filter.to
    return apiRequest<ApiHabitLog[]>('/habits/logs', { query })
}

export function apiUpsertLog(habitId: string, periodo: string, estado: EstadoLog) {
    return apiRequest<ApiHabitLog>(`/habits/${habitId}/logs/${periodo}`, { method: 'PUT', body: { estado } })
}

export function apiDeleteLog(habitId: string, periodo: string) {
    return apiRequest<void>(`/habits/${habitId}/logs/${periodo}`, { method: 'DELETE' })
}
