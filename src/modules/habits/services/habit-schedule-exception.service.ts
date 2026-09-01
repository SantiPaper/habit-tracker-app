import { sql, type Selectable } from 'kysely'

import { db } from '@/core/db/client'
import type { HabitScheduleExceptionTable } from '@/core/db/schema'

export interface HabitScheduleException {
    id: string
    habitId: string
    fecha: string
    hora: string
    duracionMinutos: number | null
}

function toDomainException(row: Selectable<HabitScheduleExceptionTable>): HabitScheduleException {
    return {
        id: row.id,
        habitId: row.habit_id,
        fecha: row.fecha,
        hora: row.hora,
        duracionMinutos: row.duracion_minutos
    }
}

/** Excepciones puntuales ("solo hoy") en un rango de fechas — para pintar Día/Semana. */
export async function getExceptionsInRange(fromKey: string, toKey: string): Promise<HabitScheduleException[]> {
    const rows = await db
        .selectFrom('habit_schedule_exception')
        .selectAll()
        .where('fecha', '>=', fromKey)
        .where('fecha', '<=', toKey)
        .execute()
    return rows.map(toDomainException)
}

/** Una por hábito+fecha — arrastrar de nuevo el mismo día pisa la excepción anterior en vez de duplicarla. */
export async function upsertException(
    habitId: string,
    fecha: string,
    hora: string,
    duracionMinutos: number | null
): Promise<HabitScheduleException> {
    const row = await db
        .insertInto('habit_schedule_exception')
        .values({ id: crypto.randomUUID(), habit_id: habitId, fecha, hora, duracion_minutos: duracionMinutos })
        .onConflict(oc =>
            oc
                .columns(['habit_id', 'fecha'])
                .doUpdateSet({ hora, duracion_minutos: duracionMinutos, updated_at: sql`datetime('now')` })
        )
        .returningAll()
        .executeTakeFirstOrThrow()
    return toDomainException(row)
}
