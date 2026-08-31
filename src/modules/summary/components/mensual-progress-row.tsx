import { useMonthlyStreakClaim } from '../hooks/use-monthly-streak-claim'
import { usePeriodLog, useSetPeriodLog } from '../hooks/use-period-log'

import { EstadoToggle } from '@/components/estado-toggle'
import { toIsoMonthKey } from '@/lib/date/period'
import { ClaimButton } from '@/modules/gamification/components/claim-button'
import type { Habit } from '@/modules/habits/types/habit.types'

/**
 * Fila de "Resumen" para un hábito mensual — sin rango de liga (mensual no entra a las ligas, un
 * mes es una unidad muy grande para esa escala), solo marcar este mes + el reclamo de XP escalado
 * por racha cuando corresponde.
 */
export function MensualProgressRow({ habit }: { habit: Habit }) {
    const periodo = toIsoMonthKey(new Date())
    const { data: log } = usePeriodLog(habit.id, periodo)
    const setPeriodLogMutation = useSetPeriodLog(habit.id, periodo)
    const { data: claim } = useMonthlyStreakClaim(habit)

    return (
        <div className='border-border bg-surface flex flex-col gap-3 rounded-2xl border px-4.5 py-3.5'>
            <div className='flex items-center justify-between'>
                <div className='flex flex-col gap-0.5'>
                    <span className='text-text text-[15px] font-medium'>{habit.nombre}</span>
                    <span className='text-text-muted font-mono text-[11px] font-semibold tracking-wider uppercase'>
                        Este mes
                    </span>
                </div>
                <EstadoToggle value={log?.estado ?? null} onChange={estado => setPeriodLogMutation.mutate(estado)} />
            </div>

            {claim && (
                <div className='border-border flex items-center justify-between border-t pt-3'>
                    <span className='text-text-muted font-mono text-xs tracking-wide'>
                        {claim.racha} {claim.racha === 1 ? 'mes seguido' : 'meses seguidos'}
                    </span>
                    <ClaimButton habitId={habit.id} tipo='mensual' periodo={claim.periodo} xpAmount={claim.xpAmount} />
                </div>
            )}
        </div>
    )
}
