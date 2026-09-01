import type { NewScheduleBlockInput } from '../services/habit-schedule-block.service'
import type { HabitScheduleBlock } from '../types/habit.types'

/**
 * Prepara la lista completa de bloques para "cambiar este día de la semana para siempre" —
 * identifica el bloque EXACTO que se arrastró por `targetBlockId` (no "cualquier bloque que
 * incluya este día") y le saca `dayOfWeek` (si se queda sin días, se descarta entero); el resto de
 * los días que compartía bloque conservan su horario de siempre. Es clave usar el `id` exacto y no
 * solo el día: un hábito puede tener dos bloques distintos el mismo día (ej. mañana y tarde) — si
 * se tocaran los dos por igual, arrastrar uno borraría el otro en vez de dejarlo como estaba (bug
 * real, reportado por el usuario). Otros bloques que también incluyan `dayOfWeek` pero no sean el
 * arrastrado quedan completamente intactos. Pensada para pasar directo a
 * `replaceScheduleBlocksForHabit` (reemplazo completo).
 */
export function splitDayIntoNewTime(
    blocks: HabitScheduleBlock[],
    targetBlockId: string | null,
    dayOfWeek: number,
    newHora: string
): NewScheduleBlockInput[] {
    const result: NewScheduleBlockInput[] = []
    let movedDuration: number | null = null

    for (const block of blocks) {
        if (block.id === targetBlockId) {
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
