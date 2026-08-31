import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { claimPeriodBonus, getPeriodClaim } from '../services/xp.service'
import type { PeriodoTipo } from '../types/gamification.types'

import { useToastStore } from '@/core/stores/toast-store'

export function periodClaimQueryKey(habitId: string, tipo: PeriodoTipo, periodo: string) {
    return ['gamification', 'claim', habitId, tipo, periodo] as const
}

export function usePeriodClaim(habitId: string, tipo: PeriodoTipo, periodo: string) {
    return useQuery({
        queryKey: periodClaimQueryKey(habitId, tipo, periodo),
        queryFn: () => getPeriodClaim(habitId, tipo, periodo)
    })
}

interface ClaimInput {
    habitId: string
    tipo: PeriodoTipo
    periodo: string
    xpOtorgado: number
}

export function useClaimPeriodBonus() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ habitId, tipo, periodo, xpOtorgado }: ClaimInput) =>
            claimPeriodBonus(habitId, tipo, periodo, xpOtorgado),
        onSuccess: (_result, { habitId, tipo, periodo, xpOtorgado }) => {
            queryClient.invalidateQueries({ queryKey: periodClaimQueryKey(habitId, tipo, periodo) })
            queryClient.invalidateQueries({ queryKey: ['gamification'] })
            useToastStore.getState().addToast('success', `+${xpOtorgado} XP reclamado`)
        },
        onError: error => {
            console.error('[claim-period-bonus] failed', error)
            useToastStore.getState().addToast('error', 'No se pudo reclamar el XP')
        }
    })
}
