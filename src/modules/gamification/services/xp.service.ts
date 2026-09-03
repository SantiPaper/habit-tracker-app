import type { PeriodClaim, PeriodoTipo } from '../types/gamification.types'

import { apiCreateClaim, apiListClaims } from './claim-api.service'

import { apiListLogs } from '@/modules/habits/services/habit-log-api.service'
import type { Settings } from '@/modules/settings/types/settings.types'

export async function getXpTotal(settings: Settings): Promise<number> {
    const [logs, claims] = await Promise.all([apiListLogs(), apiListClaims()])

    const xpDiario = logs.filter(l => l.estado === 'cumplido').length * settings.xpPorCumplido
    const xpReclamado = claims.reduce((sum, claim) => sum + claim.xpOtorgado, 0)

    return xpDiario + xpReclamado
}

export async function getPeriodClaim(habitId: string, tipo: PeriodoTipo, periodo: string): Promise<PeriodClaim | null> {
    const claims = await apiListClaims({ habitId, tipo, periodo })
    const row = claims[0]
    return row
        ? { id: row.id, habitId: row.habitId, tipo: row.tipo, periodo: row.periodo, xpOtorgado: row.xpOtorgado }
        : null
}

export async function claimPeriodBonus(
    habitId: string,
    tipo: PeriodoTipo,
    periodo: string,
    xpOtorgado: number
): Promise<void> {
    await apiCreateClaim(habitId, tipo, periodo, xpOtorgado)
}
