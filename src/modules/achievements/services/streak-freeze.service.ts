import {
    apiConsumeStreakFreeze,
    apiEarnStreakFreeze,
    apiListStreakFreezes,
    type ApiStreakFreeze
} from './streak-freeze-api.service'

export interface StreakFreeze {
    id: string
    habitId: string
    milestoneRacha: number
    earnedAt: string
    consumedPeriodo: string | null
    consumedAt: string | null
}

function toDomainFreeze(row: ApiStreakFreeze): StreakFreeze {
    return {
        id: row.id,
        habitId: row.habitId,
        milestoneRacha: row.milestoneRacha,
        earnedAt: row.earnedAt,
        consumedPeriodo: row.consumedPeriodo,
        consumedAt: row.consumedAt
    }
}

/** Freezes ganados y todavía sin gastar, más viejos primero — el orden en que se gastan. Sin
 * endpoint dedicado para "solo sin gastar": son pocos por hábito, se filtra en JS. */
export async function listUnspentFreezes(habitId: string): Promise<StreakFreeze[]> {
    const rows = await apiListStreakFreezes(habitId)
    return rows
        .filter(row => row.consumedPeriodo === null)
        .sort((a, b) => a.earnedAt.localeCompare(b.earnedAt))
        .map(toDomainFreeze)
}

export async function countUnspentFreezes(habitId: string): Promise<number> {
    const unspent = await listUnspentFreezes(habitId)
    return unspent.length
}

/** ¿Ya se resolvió este ciclo/período para este hábito? (perfecto solo, o ya cubierto por un
 * freeze) — evita reprocesar el mismo período en cada chequeo diario. */
export async function isPeriodoResolved(habitId: string, periodo: string): Promise<boolean> {
    const rows = await apiListStreakFreezes(habitId)
    return rows.some(row => row.consumedPeriodo === periodo)
}

/**
 * Gana los freezes que correspondan según la racha actual — un freeze cada 2 semanas de racha
 * perfecta (milestones 2, 4, 6, ...). Idempotente vía el UNIQUE(habitId, milestoneRacha) del
 * server (upsert que no pisa nada si ya existía). Devuelve cuántos freezes nuevos se ganaron.
 */
export async function earnDueFreezes(habitId: string, currentStreak: number): Promise<number> {
    if (currentStreak < 2) return 0

    const existing = await apiListStreakFreezes(habitId)
    const earnedMilestones = new Set(existing.map(row => row.milestoneRacha))

    let newlyEarned = 0
    for (let milestone = 2; milestone <= currentStreak; milestone += 2) {
        if (earnedMilestones.has(milestone)) continue
        await apiEarnStreakFreeze(habitId, milestone)
        newlyEarned++
    }
    return newlyEarned
}

/** Marca gastados los `count` freezes sin usar más viejos, asociándolos al `periodo` que cubrieron. */
export async function consumeFreezesForPeriodo(habitId: string, periodo: string, count: number): Promise<void> {
    const unspent = await listUnspentFreezes(habitId)
    const toConsume = unspent.slice(0, count)

    for (const freeze of toConsume) {
        await apiConsumeStreakFreeze(habitId, freeze.id, periodo)
    }
}
