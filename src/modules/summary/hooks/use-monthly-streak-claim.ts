import { useQuery } from '@tanstack/react-query'
import { subMonths } from 'date-fns'

import { toIsoMonthKey } from '@/lib/date/period'
import { computePeriodStreak } from '@/modules/achievements/lib/streak'
import { getLogsForHabit } from '@/modules/habits/services/habit-log.service'
import type { Habit } from '@/modules/habits/types/habit.types'
import { useSettings } from '@/modules/settings/hooks/use-settings'

export interface MonthlyStreakClaimInfo {
    /** El mes anterior calendario, ya cerrado — es lo único que se puede reclamar. */
    periodo: string
    /** Racha de meses seguidos cumplidos terminando en ese mes anterior. */
    racha: number
    xpAmount: number
}

/**
 * Si un hábito mensual tiene algo para reclamar: el mes calendario anterior tiene que estar
 * explícitamente `cumplido` (no alcanza con que la racha sea > 0 — un mes pausado no corta la
 * racha pero tampoco es algo nuevo para reclamar). El monto escala con la racha de meses seguidos.
 */
export function useMonthlyStreakClaim(habit: Habit) {
    const { data: settings } = useSettings()

    return useQuery({
        queryKey: ['monthly-streak-claim', habit.id],
        queryFn: async (): Promise<MonthlyStreakClaimInfo | null> => {
            const today = new Date()
            const previousMonthKey = toIsoMonthKey(subMonths(today, 1))

            const logs = await getLogsForHabit(habit.id)
            const previousLog = logs.find(log => log.periodo === previousMonthKey)
            if (previousLog?.estado !== 'cumplido') return null

            const racha = computePeriodStreak(habit, logs, 'mensual', today).actual
            if (racha === 0 || !settings) return null

            return { periodo: previousMonthKey, racha, xpAmount: racha * settings.xpPorMesRacha }
        },
        enabled: habit.tipo === 'mensual' && !!settings
    })
}
