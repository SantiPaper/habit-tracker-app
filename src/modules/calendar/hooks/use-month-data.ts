import { useQuery } from '@tanstack/react-query'
import { endOfMonth, endOfWeek, startOfMonth, startOfWeek } from 'date-fns'

import { getMonthGridDays } from '../lib/month-grid'

import { toDateKey } from '@/lib/date/period'
import { isDueOnDate } from '@/modules/habits/lib/is-due-on-date'
import { getLogsForPeriodRange } from '@/modules/habits/services/habit-log.service'
import { listHabits } from '@/modules/habits/services/habit.service'
import type { EstadoLog } from '@/modules/habits/types/habit-log.types'
import type { Habit } from '@/modules/habits/types/habit.types'

export interface CalendarDayItem {
    habit: Habit
    estado: EstadoLog | null
}

export function monthDataQueryKey(monthAnchor: Date) {
    return ['calendar', 'month', toDateKey(startOfMonth(monthAnchor))] as const
}

export function useMonthData(monthAnchor: Date) {
    return useQuery({
        queryKey: monthDataQueryKey(monthAnchor),
        queryFn: async (): Promise<Map<string, CalendarDayItem[]>> => {
            const days = getMonthGridDays(monthAnchor)
            const start = startOfWeek(startOfMonth(monthAnchor), { weekStartsOn: 1 })
            const end = endOfWeek(endOfMonth(monthAnchor), { weekStartsOn: 1 })

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
