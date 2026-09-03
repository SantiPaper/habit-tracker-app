import type { EstadoLog, HabitLog } from '../types/habit-log.types'

import { apiDeleteLog, apiListLogs, apiUpsertLog, type ApiHabitLog } from './habit-log-api.service'

function toDomainHabitLog(row: ApiHabitLog): HabitLog {
    return {
        id: row.id,
        habitId: row.habitId,
        periodo: row.periodo,
        estado: row.estado
    }
}

export async function getLogsForPeriod(periodo: string): Promise<HabitLog[]> {
    const rows = await apiListLogs({ periodo })
    return rows.map(toDomainHabitLog)
}

export async function getLogsForPeriodRange(fromKey: string, toKey: string): Promise<HabitLog[]> {
    const rows = await apiListLogs({ from: fromKey, to: toKey })
    return rows.map(toDomainHabitLog)
}

/**
 * Todos los logs de un hábito, sin filtro de rango. Necesaria para `semanal`/`mensual` — su
 * `periodo` es una clave ISO de semana/mes (ej. "2026-W35", "2026-08"), no una fecha `YYYY-MM-DD`,
 * así que compararla lexicográficamente contra `habit.fechaInicio` (como hace
 * `getLogsForHabitInRange`) da resultados falsos.
 */
export async function getLogsForHabit(habitId: string): Promise<HabitLog[]> {
    const rows = await apiListLogs({ habitId })
    return rows.map(toDomainHabitLog)
}

export async function getLogsForHabitInRange(habitId: string, fromKey: string, toKey: string): Promise<HabitLog[]> {
    const rows = await apiListLogs({ habitId, from: fromKey, to: toKey })
    return rows.map(toDomainHabitLog)
}

export async function getLogByPeriod(habitId: string, periodo: string): Promise<HabitLog | null> {
    const rows = await apiListLogs({ habitId, periodo })
    return rows[0] ? toDomainHabitLog(rows[0]) : null
}

export async function upsertHabitLog(habitId: string, periodo: string, estado: EstadoLog): Promise<HabitLog> {
    const row = await apiUpsertLog(habitId, periodo, estado)
    return toDomainHabitLog(row)
}

/**
 * Vuelve un día/período a "sin marcar" — borra el log en vez de guardar un estado, que es como se
 * representa `null` en toda la app. Sin tumba: a diferencia del sync local-first, un DELETE contra
 * el server es visible al toque para cualquier cliente que consulte, no hace falta avisar aparte.
 */
export async function deleteHabitLog(habitId: string, periodo: string): Promise<void> {
    await apiDeleteLog(habitId, periodo)
}
