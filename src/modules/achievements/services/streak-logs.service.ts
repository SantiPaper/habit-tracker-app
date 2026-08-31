import { toDateKey } from '@/lib/date/period'
import { getLogsForHabit, getLogsForHabitInRange } from '@/modules/habits/services/habit-log.service'
import type { HabitLog } from '@/modules/habits/types/habit-log.types'
import type { Habit } from '@/modules/habits/types/habit.types'

/**
 * Trae los logs que necesita `computeStreak` para un hábito, según su tipo — `diario_recurrente`
 * usa un rango de fechas (`periodo` es `YYYY-MM-DD`), `semanal` necesita todos sus logs (`periodo`
 * es una clave ISO de semana, no comparable como fecha). Compartido por `use-habit-streak.ts` y
 * `use-next-milestones.ts` para no repetir esta rama en dos lugares.
 */
export async function fetchStreakLogs(habit: Habit, today: Date): Promise<HabitLog[]> {
    if (habit.tipo === 'diario_recurrente') {
        return getLogsForHabitInRange(habit.id, habit.fechaInicio, toDateKey(today))
    }
    if (habit.tipo === 'semanal') {
        return getLogsForHabit(habit.id)
    }
    return []
}
