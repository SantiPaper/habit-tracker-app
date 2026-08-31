import type { EstadoLog } from '../types/habit-log.types'
import type { Habit } from '../types/habit.types'

import type { ScheduleSlot } from './schedule-blocks'

/** Sin ningún bloque de horario hoy, un hábito de importancia alta se considera "atrasado" recién pasada esta hora. */
const NO_HORA_ALERT_HOUR = 18

/**
 * Un hábito de importancia alta que sigue sin marcarse y ya se pasó — por el fin del último
 * bloque de horario de hoy si tiene alguno, o pasadas las 18:00 si no tiene ninguno. Pensado
 * únicamente para el día de hoy: quien llama debe chequear que la fecha que se está mostrando
 * sea hoy antes de usar esto, y resolver `blocksToday` con `getBlocksForDate(habit, hoy)`.
 */
export function isImportanceOverdue(
    habit: Pick<Habit, 'importancia'>,
    estado: EstadoLog | null,
    now: Date,
    blocksToday: ScheduleSlot[]
): boolean {
    if (habit.importancia !== 'alta' || estado !== null) return false

    if (blocksToday.length > 0) {
        const nowMinutes = now.getHours() * 60 + now.getMinutes()
        const dueMinutes = Math.max(
            ...blocksToday.map(block => {
                const [hours, minutes] = block.hora.split(':').map(Number)
                return hours * 60 + minutes + (block.duracionMinutos ?? 0)
            })
        )
        return nowMinutes > dueMinutes
    }

    return now.getHours() >= NO_HORA_ALERT_HOUR
}
