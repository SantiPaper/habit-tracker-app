import { useQuery } from '@tanstack/react-query'

import { computeStreak } from '../lib/streak'
import { fetchStreakLogs } from '../services/streak-logs.service'

import { toDateKey } from '@/lib/date/period'
import type { Habit } from '@/modules/habits/types/habit.types'

export function useHabitStreak(habit: Habit) {
    const today = new Date()
    const todayKey = toDateKey(today)

    return useQuery({
        queryKey: ['streak', habit.id, todayKey],
        queryFn: async () => {
            const logs = await fetchStreakLogs(habit, today)
            return computeStreak(habit, logs, today)
        },
        enabled: habit.tipo === 'diario_recurrente' || habit.tipo === 'semanal'
    })
}
