import { sql, type Selectable } from 'kysely'

import { db } from '@/core/db/client'
import type { HabitStreakFreezeTable } from '@/core/db/schema'

export interface StreakFreeze {
    id: string
    habitId: string
    milestoneRacha: number
    earnedAt: string
    consumedPeriodo: string | null
    consumedAt: string | null
}

function toDomainFreeze(row: Selectable<HabitStreakFreezeTable>): StreakFreeze {
    return {
        id: row.id,
        habitId: row.habit_id,
        milestoneRacha: row.milestone_racha,
        earnedAt: row.earned_at,
        consumedPeriodo: row.consumed_periodo,
        consumedAt: row.consumed_at
    }
}

/** Freezes ganados y todavía sin gastar, más viejos primero — el orden en que se gastan. */
export async function listUnspentFreezes(habitId: string): Promise<StreakFreeze[]> {
    const rows = await db
        .selectFrom('habit_streak_freeze')
        .selectAll()
        .where('habit_id', '=', habitId)
        .where('consumed_periodo', 'is', null)
        .orderBy('earned_at', 'asc')
        .execute()
    return rows.map(toDomainFreeze)
}

export async function countUnspentFreezes(habitId: string): Promise<number> {
    const row = await db
        .selectFrom('habit_streak_freeze')
        .select(eb => eb.fn.countAll<number>().as('count'))
        .where('habit_id', '=', habitId)
        .where('consumed_periodo', 'is', null)
        .executeTakeFirstOrThrow()
    return Number(row.count)
}

/** ¿Ya se resolvió este ciclo/período para este hábito? (perfecto solo, o ya cubierto por un
 * freeze) — evita reprocesar el mismo período en cada chequeo diario. */
export async function isPeriodoResolved(habitId: string, periodo: string): Promise<boolean> {
    const row = await db
        .selectFrom('habit_streak_freeze')
        .select('id')
        .where('habit_id', '=', habitId)
        .where('consumed_periodo', '=', periodo)
        .executeTakeFirst()
    return row !== undefined
}

/**
 * Gana los freezes que correspondan según la racha actual — un freeze cada 2 semanas de racha
 * perfecta (milestones 2, 4, 6, ...). Idempotente: si ya se ganó el freeze de un milestone, no lo
 * duplica (además de este chequeo, la tabla tiene un UNIQUE(habit_id, milestone_racha) de respaldo).
 * Devuelve cuántos freezes nuevos se ganaron en esta pasada.
 */
export async function earnDueFreezes(habitId: string, currentStreak: number): Promise<number> {
    if (currentStreak < 2) return 0

    const earned = await db
        .selectFrom('habit_streak_freeze')
        .select('milestone_racha')
        .where('habit_id', '=', habitId)
        .execute()
    const earnedMilestones = new Set(earned.map(row => row.milestone_racha))

    let newlyEarned = 0
    for (let milestone = 2; milestone <= currentStreak; milestone += 2) {
        if (earnedMilestones.has(milestone)) continue
        await db
            .insertInto('habit_streak_freeze')
            .values({ id: crypto.randomUUID(), habit_id: habitId, milestone_racha: milestone })
            .onConflict(oc => oc.columns(['habit_id', 'milestone_racha']).doNothing())
            .execute()
        newlyEarned++
    }
    return newlyEarned
}

/** Marca gastados los `count` freezes sin usar más viejos, asociándolos al `periodo` que cubrieron. */
export async function consumeFreezesForPeriodo(habitId: string, periodo: string, count: number): Promise<void> {
    const unspent = await listUnspentFreezes(habitId)
    const toConsume = unspent.slice(0, count)

    for (const freeze of toConsume) {
        await db
            .updateTable('habit_streak_freeze')
            .set({ consumed_periodo: periodo, consumed_at: sql`datetime('now')` })
            .where('id', '=', freeze.id)
            .execute()
    }
}
