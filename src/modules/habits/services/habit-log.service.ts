import { sql, type Selectable } from 'kysely'

import type { EstadoLog, HabitLog } from '../types/habit-log.types'

import { db } from '@/core/db/client'
import type { HabitLogTable } from '@/core/db/schema'

function toDomainHabitLog(row: Selectable<HabitLogTable>): HabitLog {
    return {
        id: row.id,
        habitId: row.habit_id,
        periodo: row.periodo,
        estado: row.estado
    }
}

export async function getLogsForPeriod(periodo: string): Promise<HabitLog[]> {
    const rows = await db.selectFrom('habit_log').selectAll().where('periodo', '=', periodo).execute()
    return rows.map(toDomainHabitLog)
}

export async function getLogsForPeriodRange(fromKey: string, toKey: string): Promise<HabitLog[]> {
    const rows = await db
        .selectFrom('habit_log')
        .selectAll()
        .where('periodo', '>=', fromKey)
        .where('periodo', '<=', toKey)
        .execute()
    return rows.map(toDomainHabitLog)
}

/**
 * Todos los logs de un hábito, sin filtro de rango. Necesaria para `semanal`/`mensual` — su
 * `periodo` es una clave ISO de semana/mes (ej. "2026-W35", "2026-08"), no una fecha `YYYY-MM-DD`,
 * así que compararla lexicográficamente contra `habit.fechaInicio` (como hace
 * `getLogsForHabitInRange`) da resultados falsos.
 */
export async function getLogsForHabit(habitId: string): Promise<HabitLog[]> {
    const rows = await db.selectFrom('habit_log').selectAll().where('habit_id', '=', habitId).execute()
    return rows.map(toDomainHabitLog)
}

export async function getLogsForHabitInRange(habitId: string, fromKey: string, toKey: string): Promise<HabitLog[]> {
    const rows = await db
        .selectFrom('habit_log')
        .selectAll()
        .where('habit_id', '=', habitId)
        .where('periodo', '>=', fromKey)
        .where('periodo', '<=', toKey)
        .execute()
    return rows.map(toDomainHabitLog)
}

export async function getLogByPeriod(habitId: string, periodo: string): Promise<HabitLog | null> {
    const row = await db
        .selectFrom('habit_log')
        .selectAll()
        .where('habit_id', '=', habitId)
        .where('periodo', '=', periodo)
        .executeTakeFirst()
    return row ? toDomainHabitLog(row) : null
}

export async function upsertHabitLog(habitId: string, periodo: string, estado: EstadoLog): Promise<HabitLog> {
    const row = await db
        .insertInto('habit_log')
        .values({ id: crypto.randomUUID(), habit_id: habitId, periodo, estado })
        // `updated_at` explícito acá a propósito: el default de la columna solo aplica al INSERT
        // inicial — sin esto, la fecha de "última modificación" quedaba congelada para siempre en
        // la primera vez que se creó el log, sin importar cuántas veces se re-marcara después.
        .onConflict(oc => oc.columns(['habit_id', 'periodo']).doUpdateSet({ estado, updated_at: sql`datetime('now')` }))
        .returningAll()
        .executeTakeFirstOrThrow()
    return toDomainHabitLog(row)
}

/**
 * Vuelve un día/período a "sin marcar" — borra el log en vez de guardar un estado, que es como se
 * representa `null` en toda la app. Deja una "tumba" con el mismo `id` de la fila borrada — sin
 * esto, la sincronización entre dispositivos no tendría forma de enterarse de que algo desapareció
 * (un DELETE real no deja rastro).
 */
export async function deleteHabitLog(habitId: string, periodo: string): Promise<void> {
    const existing = await db
        .selectFrom('habit_log')
        .select('id')
        .where('habit_id', '=', habitId)
        .where('periodo', '=', periodo)
        .executeTakeFirst()

    if (!existing) return

    await db.deleteFrom('habit_log').where('habit_id', '=', habitId).where('periodo', '=', periodo).execute()

    await db
        .insertInto('habit_log_tombstone')
        .values({ id: existing.id, habit_id: habitId, periodo })
        .onConflict(oc => oc.column('id').doNothing())
        .execute()
}
