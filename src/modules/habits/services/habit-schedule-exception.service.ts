import {
    apiListExceptions,
    apiUpsertException,
    type ApiScheduleException
} from './habit-schedule-exception-api.service'

export interface HabitScheduleException {
    id: string
    habitId: string
    fecha: string
    hora: string
    duracionMinutos: number | null
}

function toDomainException(row: ApiScheduleException): HabitScheduleException {
    return {
        id: row.id,
        habitId: row.habitId,
        fecha: row.fecha,
        hora: row.hora,
        duracionMinutos: row.duracionMinutos
    }
}

/** Excepciones puntuales ("solo hoy") en un rango de fechas — para pintar Día/Semana. */
export async function getExceptionsInRange(fromKey: string, toKey: string): Promise<HabitScheduleException[]> {
    const rows = await apiListExceptions(fromKey, toKey)
    return rows.map(toDomainException)
}

/** Una por hábito+fecha — arrastrar de nuevo el mismo día pisa la excepción anterior en vez de duplicarla. */
export async function upsertException(
    habitId: string,
    fecha: string,
    hora: string,
    duracionMinutos: number | null
): Promise<HabitScheduleException> {
    const row = await apiUpsertException(habitId, fecha, hora, duracionMinutos)
    return toDomainException(row)
}
