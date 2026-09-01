import { useQuery } from '@tanstack/react-query'
import { endOfMonth, endOfWeek, startOfMonth, startOfWeek } from 'date-fns'

import { computeDailyCompletion, type DailyCompletion } from '../lib/daily-completion'

import { toDateKey } from '@/lib/date/period'
import { getMonthGridDays } from '@/modules/calendar/lib/month-grid'
import { getLogsForPeriodRange } from '@/modules/habits/services/habit-log.service'
import { listHabits } from '@/modules/habits/services/habit.service'

export function monthlyPerformanceQueryKey(monthAnchor: Date) {
    return ['performance', 'month', toDateKey(startOfMonth(monthAnchor))] as const
}

export function useMonthlyPerformance(monthAnchor: Date) {
    return useQuery({
        queryKey: monthlyPerformanceQueryKey(monthAnchor),
        queryFn: async (): Promise<DailyCompletion[]> => {
            const days = getMonthGridDays(monthAnchor)
            const start = startOfWeek(startOfMonth(monthAnchor), { weekStartsOn: 1 })
            const end = endOfWeek(endOfMonth(monthAnchor), { weekStartsOn: 1 })

            const [habits, logs] = await Promise.all([
                listHabits(),
                getLogsForPeriodRange(toDateKey(start), toDateKey(end))
            ])
            return computeDailyCompletion(days, habits, logs)
        }
    })
}
