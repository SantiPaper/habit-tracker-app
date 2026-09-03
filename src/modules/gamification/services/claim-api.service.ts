import { apiRequest } from '@/modules/account/services/api-client'
import type { PeriodoTipo } from '@/modules/gamification/types/gamification.types'

export interface ApiClaim {
    id: string
    habitId: string
    userId: string
    tipo: PeriodoTipo
    periodo: string
    xpOtorgado: number
    reclamadoEn: string
}

export interface ListClaimsFilter {
    habitId?: string
    tipo?: PeriodoTipo
    periodo?: string
}

export function apiListClaims(filter: ListClaimsFilter = {}) {
    const query: Record<string, string> = {}
    if (filter.habitId) query.habitId = filter.habitId
    if (filter.tipo) query.tipo = filter.tipo
    if (filter.periodo) query.periodo = filter.periodo
    return apiRequest<ApiClaim[]>('/habits/claims', { query })
}

export function apiCreateClaim(habitId: string, tipo: PeriodoTipo, periodo: string, xpOtorgado: number) {
    return apiRequest<ApiClaim>(`/habits/${habitId}/claims`, { method: 'POST', body: { tipo, periodo, xpOtorgado } })
}
