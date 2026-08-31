import { useQuery } from '@tanstack/react-query'
import { eachDayOfInterval, endOfWeek, startOfWeek } from 'date-fns'

import type { CalendarDayItem } from './use-month-data'

import { toDateKey } from '@/lib/date/period'
import { isDueOnDate } from '@/modules/habits/lib/is-due-on-date'
import { getLogsForPeriodRange } from '@/modules/habits/services/habit-log.service'
import { listHabits } from '@/modules/habits/services/habit.service'

export function getWeekDays(weekAnchor: Date): Date[] {
    const start = startOfWeek(weekAnchor, { weekStartsOn: 1 })
    const end = endOfWeek(weekAnchor, { weekStartsOn: 1 })
    return eachDayOfInterval({ start, end })
}

export function weekDataQueryKey(weekAnchor: Date) {
    return ['calendar', 'week', toDateKey(startOfWeek(weekAnchor, { weekStartsOn: 1 }))] as const
}

export function useWeekData(weekAnchor: Date) {
    return useQuery({
        queryKey: weekDataQueryKey(weekAnchor),
        queryFn: async (): Promise<Map<string, CalendarDayItem[]>> => {
            const days = getWeekDays(weekAnchor)
            const start = days[0]
            const end = days[days.length - 1]

            const [habits, logs] = await Promise.all([
                listHabits(),
                getLogsForPeriodRange(toDateKey(start), toDateKey(end))
            ])
            const activeHabits = habits.filter(h => h.activo)
            const estadoByKey = new Map(logs.map(log => [`${log.habitId}|${log.periodo}`, log.estado]))

            const byDate = new Map<string, CalendarDayItem[]>()
            for (const day of days) {
                const dateKey = toDateKey(day)
                const items = activeHabits
                    .filter(habit => isDueOnDate(habit, day))
                    .map(habit => ({ habit, estado: estadoByKey.get(`${habit.id}|${dateKey}`) ?? null }))
                byDate.set(dateKey, items)
            }
            return byDate
        }
    })
}
