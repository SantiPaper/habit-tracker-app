import type { NewScheduleBlockInput } from '../services/habit-schedule-block.service'
import type { HabitScheduleBlock } from '../types/habit.types'

/**
 * Prepara la lista completa de bloques para "cambiar este día de la semana para siempre" — saca
 * `dayOfWeek` de cualquier bloque que lo incluya (si el bloque se queda sin días, se descarta
 * entero en vez de dejar un bloque vacío) y agrega uno nuevo, solo para ese día, con la hora
 * nueva. El resto de los días que compartían bloque con `dayOfWeek` conservan su horario de
 * siempre. Pensada para pasar directo a `replaceScheduleBlocksForHabit` (reemplazo completo).
 */
export function splitDayIntoNewTime(
    blocks: HabitScheduleBlock[],
    dayOfWeek: number,
    newHora: string
): NewScheduleBlockInput[] {
    const result: NewScheduleBlockInput[] = []
    let movedDuration: number | null = null

    for (const block of blocks) {
        if (block.diasSemana.includes(dayOfWeek)) {
            movedDuration = block.duracionMinutos
            const remainingDays = block.diasSemana.filter(d => d !== dayOfWeek)
            if (remainingDays.length > 0) {
                result.push({ diasSemana: remainingDays, hora: block.hora, duracionMinutos: block.duracionMinutos })
            }
        } else {
            result.push({ diasSemana: block.diasSemana, hora: block.hora, duracionMinutos: block.duracionMinutos })
        }
    }

    result.push({ diasSemana: [dayOfWeek], hora: newHora, duracionMinutos: movedDuration })
    return result
}
