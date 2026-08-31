import type { CSSProperties } from 'react'

import { useClaimPeriodBonus, usePeriodClaim } from '../hooks/use-period-claim'
import type { PeriodoTipo } from '../types/gamification.types'

import { useFlashOnTrue } from '@/lib/hooks/use-flash-on-true'

interface ClaimButtonProps {
    habitId: string
    tipo: PeriodoTipo
    periodo: string
    xpAmount: number
}

export function ClaimButton({ habitId, tipo, periodo, xpAmount }: ClaimButtonProps) {
    const { data: claim, isLoading } = usePeriodClaim(habitId, tipo, periodo)
    const claimMutation = useClaimPeriodBonus()
    const justClaimed = useFlashOnTrue(claimMutation.isSuccess, 900)

    if (isLoading) return null

    if (claim) {
        return (
            <span
                className={`bg-surface-2 text-text-muted rounded-full px-2.5 py-1 font-mono text-[11px] font-bold tracking-wider uppercase ${justClaimed ? 'spark-pulse' : ''}`}
                style={justClaimed ? ({ '--spark-color': 'var(--color-accent)' } as CSSProperties) : undefined}
            >
                Reclamado ✓
            </span>
        )
    }

    return (
        <button
            type='button'
            onClick={() => claimMutation.mutate({ habitId, tipo, periodo, xpOtorgado: xpAmount })}
            disabled={claimMutation.isPending}
            className='bg-accent text-accent-ink rounded-full px-2.5 py-1 font-mono text-[11px] font-bold tracking-wider uppercase disabled:opacity-50'
        >
            Reclamar +{xpAmount} XP
        </button>
    )
}
