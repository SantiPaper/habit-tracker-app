import type { Selectable, Transaction } from 'kysely'

import type { HabitScheduleBlock } from '../types/habit.types'

import { db } from '@/core/db/client'
import type { Database, HabitScheduleBlockTable } from '@/core/db/schema'

export function toDomainScheduleBlock(row: Selectable<HabitScheduleBlockTable>): HabitScheduleBlock {
    return {
        id: row.id,
        diasSemana: JSON.parse(row.dias_semana) as number[],
        hora: row.hora,
        duracionMinutos: row.duracion_minutos
    }
}

/** Todos los bloques de horario de todos los hábitos, para agrupar por `habit_id` en JS y evitar N+1 al listar hábitos. */
export async function listAllScheduleBlocks(): Promise<Selectable<HabitScheduleBlockTable>[]> {
    return db.selectFrom('habit_schedule_block').selectAll().execute()
}

export interface NewScheduleBlockInput {
    diasSemana: number[]
    hora: string
    duracionMinutos: number | null
}

/**
 * Reemplazo completo (no diffing): borra todos los bloques del hábito y vuelve a insertar la
 * lista nueva, devolviendo las filas insertadas. Acepta una transacción del caller (`trx`) para
 * participar en la misma operación atómica que crea/reemplaza el hábito — si no se pasa, corre
 * en su propia conexión.
 */
export async function replaceScheduleBlocksForHabit(
    habitId: string,
    blocks: NewScheduleBlockInput[],
    trx?: Transaction<Database>
): Promise<Selectable<HabitScheduleBlockTable>[]> {
    const runner = trx ?? db

    await runner.deleteFrom('habit_schedule_block').where('habit_id', '=', habitId).execute()

    if (blocks.length === 0) return []

    return runner
        .insertInto('habit_schedule_block')
        .values(
            blocks.map(block => ({
                id: crypto.randomUUID(),
                habit_id: habitId,
                dias_semana: JSON.stringify(block.diasSemana),
                hora: block.hora,
                duracion_minutos: block.duracionMinutos
            }))
        )
        .returningAll()
        .execute()
}
