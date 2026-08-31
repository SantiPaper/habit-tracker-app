import { usePreviousCycleRollup } from '../hooks/use-cycle-rollup'

import { RankBadgeRow } from '@/modules/achievements/components/rank-badge-row'
import { ClaimButton } from '@/modules/gamification/components/claim-button'
import type { Habit } from '@/modules/habits/types/habit.types'
import { useSettings } from '@/modules/settings/hooks/use-settings'

/**
 * Fila de "Resumen" para un hábito diario recurrente — combina el rango de liga (`RankBadgeRow`,
 * antes en la pantalla "Logros" separada) con el reclamo de "semana completada" (antes "Resumen").
 * A pedido del usuario, se simplificó: sin barras de progreso X/X ni seguimiento de mes por ahora
 * — solo el reclamo cuando la semana anterior salió perfecta (la racha/liga ya suma sola con cada
 * semana perfecta, se haya reclamado o no — reclamar es solo el bonus de XP).
 */
export function RecurrenteProgressRow({ habit }: { habit: Habit }) {
    const { data: weekPrevious } = usePreviousCycleRollup(habit, 'semanal')
    const { data: settings } = useSettings()

    const canClaim = weekPrevious?.rollup.perfecto && settings?.xpSemanaPerfecta !== undefined

    return (
        <RankBadgeRow habit={habit}>
            {canClaim && (
                <div className='flex items-center justify-between'>
                    <span className='text-text-muted font-mono text-xs font-semibold tracking-wider uppercase'>
                        Semana completada
                    </span>
                    <ClaimButton
                        habitId={habit.id}
                        tipo='semanal'
                        periodo={weekPrevious.periodo}
                        xpAmount={settings.xpSemanaPerfecta}
                    />
                </div>
            )}
        </RankBadgeRow>
    )
}
