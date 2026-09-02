import { apiUpdateHabit, type ApiScheduleBlock } from './habit-api.service'

import type { HabitScheduleBlock } from '@/modules/habits/types/habit.types'

export function toDomainScheduleBlock(row: ApiScheduleBlock): HabitScheduleBlock {
    return {
        id: row.id,
        diasSemana: JSON.parse(row.diasSemana) as number[],
        hora: row.hora,
        duracionMinutos: row.duracionMinutos
    }
}

export interface NewScheduleBlockInput {
    diasSemana: number[]
    hora: string
    duracionMinutos: number | null
}

/**
 * Reemplazo completo (no diffing) — igual semántica que antes con SQLite local: manda la lista
 * nueva entera, el server borra los bloques viejos e inserta estos en la misma transacción (ver
 * `updateHabit` en habit-tracker-server). Devuelve las filas crudas (no domain) — el caller decide
 * si las mapea, mismo contrato que tenía la versión local.
 */
export async function replaceScheduleBlocksForHabit(
    habitId: string,
    blocks: NewScheduleBlockInput[]
): Promise<ApiScheduleBlock[]> {
    const updated = await apiUpdateHabit(habitId, {
        scheduleBlocks: blocks.map(b => ({
            diasSemana: JSON.stringify(b.diasSemana),
            hora: b.hora,
            duracionMinutos: b.duracionMinutos
        }))
    })
    return updated.scheduleBlocks
}
