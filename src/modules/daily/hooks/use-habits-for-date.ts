import { useQuery } from '@tanstack/react-query'

import { isDueOnDate } from '../../habits/lib/is-due-on-date'
import { getBlocksForDate } from '../../habits/lib/schedule-blocks'
import { getLogsForPeriod } from '../../habits/services/habit-log.service'
import { listHabits } from '../../habits/services/habit.service'
import type { EstadoLog } from '../../habits/types/habit-log.types'
import type { Habit } from '../../habits/types/habit.types'

import { toDateKey } from '@/lib/date/period'

export interface HabitOnDateItem {
    habit: Habit
    estado: EstadoLog | null
}

export function habitsForDateQueryKey(dateKey: string) {
    return ['daily', dateKey] as const
}

export function useHabitsForDate(date: Date) {
    const dateKey = toDateKey(date)

    return useQuery({
        queryKey: habitsForDateQueryKey(dateKey),
        queryFn: async (): Promise<HabitOnDateItem[]> => {
            const [habits, logs] = await Promise.all([listHabits(), getLogsForPeriod(dateKey)])
            const estadoByHabitId = new Map(logs.map(log => [log.habitId, log.estado]))

            const earliestHora = (habit: Habit) => getBlocksForDate(habit, date)[0]?.hora ?? '99:99'

            return habits
                .filter(habit => isDueOnDate(habit, date))
                .map(habit => ({ habit, estado: estadoByHabitId.get(habit.id) ?? null }))
                .sort((a, b) => earliestHora(a.habit).localeCompare(earliestHora(b.habit)))
        }
    })
}
