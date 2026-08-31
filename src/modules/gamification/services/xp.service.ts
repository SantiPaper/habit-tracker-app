import type { PeriodClaim, PeriodoTipo } from '../types/gamification.types'

import { db } from '@/core/db/client'
import type { Settings } from '@/modules/settings/types/settings.types'

export async function getXpTotal(settings: Settings): Promise<number> {
    const [cumplidoLogs, claims] = await Promise.all([
        db.selectFrom('habit_log').select('id').where('estado', '=', 'cumplido').execute(),
        db.selectFrom('habit_period_claim').select('xp_otorgado').execute()
    ])

    const xpDiario = cumplidoLogs.length * settings.xpPorCumplido
    const xpReclamado = claims.reduce((sum, claim) => sum + claim.xp_otorgado, 0)

    return xpDiario + xpReclamado
}

export async function getPeriodClaim(habitId: string, tipo: PeriodoTipo, periodo: string): Promise<PeriodClaim | null> {
    const row = await db
        .selectFrom('habit_period_claim')
        .selectAll()
        .where('habit_id', '=', habitId)
        .where('tipo', '=', tipo)
        .where('periodo', '=', periodo)
        .executeTakeFirst()

    return row
        ? { id: row.id, habitId: row.habit_id, tipo: row.tipo, periodo: row.periodo, xpOtorgado: row.xp_otorgado }
        : null
}

export async function claimPeriodBonus(
    habitId: string,
    tipo: PeriodoTipo,
    periodo: string,
    xpOtorgado: number
): Promise<void> {
    await db
        .insertInto('habit_period_claim')
        .values({ id: crypto.randomUUID(), habit_id: habitId, tipo, periodo, xp_otorgado: xpOtorgado })
        .execute()
}
