import { usePeriodLog, useSetPeriodLog } from '../hooks/use-period-log'

import { EstadoToggle } from '@/components/estado-toggle'
import { toIsoWeekKey } from '@/lib/date/period'
import { RankBadgeRow } from '@/modules/achievements/components/rank-badge-row'
import type { Habit } from '@/modules/habits/types/habit.types'

/** Fila de "Resumen" para un hábito semanal — rango de liga (comparte ligas con los recurrentes) + marcar esta semana. */
export function SemanalProgressRow({ habit }: { habit: Habit }) {
    const periodo = toIsoWeekKey(new Date())
    const { data: log } = usePeriodLog(habit.id, periodo)
    const setPeriodLogMutation = useSetPeriodLog(habit.id, periodo)

    return (
        <RankBadgeRow habit={habit}>
            <div className='flex items-center justify-between'>
                <span className='text-text-muted font-mono text-xs font-semibold tracking-wider uppercase'>
                    Esta semana
                </span>
                <EstadoToggle value={log?.estado ?? null} onChange={estado => setPeriodLogMutation.mutate(estado)} />
            </div>
        </RankBadgeRow>
    )
}
