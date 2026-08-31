import { useQuery } from '@tanstack/react-query'

import { getNivel, getXpThreshold } from '../lib/level'
import { getXpTotal } from '../services/xp.service'
import type { XpSummary } from '../types/gamification.types'

import { useSettings } from '@/modules/settings/hooks/use-settings'

export function xpSummaryQueryKey(xpPorCumplido: number, nivelDivisor: number) {
    return ['gamification', 'xp-summary', xpPorCumplido, nivelDivisor] as const
}

export function useXpSummary() {
    const { data: settings } = useSettings()

    return useQuery({
        queryKey: xpSummaryQueryKey(settings?.xpPorCumplido ?? 0, settings?.nivelDivisor ?? 1),
        queryFn: async (): Promise<XpSummary> => {
            if (!settings) throw new Error('settings not loaded')

            const xpTotal = await getXpTotal(settings)
            const nivel = getNivel(xpTotal, settings.nivelDivisor)
            const xpInicioNivel = getXpThreshold(nivel, settings.nivelDivisor)
            const xpProximoNivel = getXpThreshold(nivel + 1, settings.nivelDivisor)

            return {
                xpTotal,
                nivel,
                xpEnNivel: xpTotal - xpInicioNivel,
                xpParaProximoNivel: xpProximoNivel - xpInicioNivel
            }
        },
        enabled: !!settings
    })
}
