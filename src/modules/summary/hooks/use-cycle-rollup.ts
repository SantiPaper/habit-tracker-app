import { useQuery } from '@tanstack/react-query'

import { getCurrentCycle, getPreviousCycle } from '../lib/cycle'
import { computeRollup, type RollupResult } from '../lib/rollup'

import { toDateKey } from '@/lib/date/period'
import type { PeriodoTipo } from '@/modules/gamification/types/gamification.types'
import { getLogsForHabitInRange } from '@/modules/habits/services/habit-log.service'
import type { Habit } from '@/modules/habits/types/habit.types'

export interface CycleRollup {
    /** Clave estable del ciclo (fecha de inicio del ciclo) — usada como `periodo` al reclamar XP. */
    periodo: string
    rollup: RollupResult
}

/** El ciclo (semana/mes rotativo) que contiene "hoy" para este hábito — siempre en curso, nunca reclamable. */
export function useCurrentCycleRollup(habit: Habit, unit: PeriodoTipo) {
    const today = new Date()
    const cycle = getCurrentCycle(habit.fechaInicio, unit, today)
    const periodo = toDateKey(cycle.start)

    return useQuery({
        queryKey: ['rollup', unit, habit.id, periodo, 'current'],
        queryFn: async (): Promise<CycleRollup> => {
            const logs = await getLogsForHabitInRange(habit.id, toDateKey(cycle.start), toDateKey(cycle.end))
            return { periodo, rollup: computeRollup(habit, logs, cycle.start, cycle.end, today) }
        }
    })
}

/** El ciclo inmediatamente anterior, ya cerrado — es el único elegible para reclamar el bonus de "perfecto". */
export function usePreviousCycleRollup(habit: Habit, unit: PeriodoTipo) {
    const today = new Date()
    const cycle = getPreviousCycle(habit.fechaInicio, unit, today)
    const periodo = cycle ? toDateKey(cycle.start) : null

    return useQuery({
        queryKey: ['rollup', unit, habit.id, periodo ?? 'none', 'previous'],
        queryFn: async (): Promise<CycleRollup | null> => {
            if (!cycle || !periodo) return null
            const logs = await getLogsForHabitInRange(habit.id, toDateKey(cycle.start), toDateKey(cycle.end))
            return { periodo, rollup: computeRollup(habit, logs, cycle.start, cycle.end, today) }
        }
    })
}
