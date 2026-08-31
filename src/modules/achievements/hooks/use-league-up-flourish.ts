import { useEffect, useState } from 'react'

import { STREAK_TIERS, type StreakTier } from '../lib/tiers'

import { useToastStore } from '@/core/stores/toast-store'

const STORAGE_PREFIX = 'habit-tier-seen:'

function tierOrder(tierId: string): number {
    return STREAK_TIERS.findIndex(t => t.id === tierId)
}

/**
 * Detecta cuando un hábito acaba de subir de liga, comparando contra la última liga vista
 * (guardada en `localStorage` por hábito — dato puramente cosmético, no justifica una tabla
 * nueva, mismo patrón que el dismiss del banner de recordatorios). Devuelve `true` por un
 * instante para disparar el destello visual del badge, y además dispara un toast de celebración.
 *
 * La primera vez que se ve un hábito (no hay nada guardado todavía) solo registra la liga
 * actual sin festejar — evita festejar de golpe todo el progreso que ya tenía antes de que
 * existiera esta feature.
 */
export function useLeagueUpFlourish(habitId: string, habitNombre: string, tier: StreakTier | null): boolean {
    const [flourishing, setFlourishing] = useState(false)

    useEffect(() => {
        const key = STORAGE_PREFIX + habitId
        let lastSeenId: string | null

        try {
            lastSeenId = localStorage.getItem(key)
        } catch {
            return
        }

        const currentId = tier?.id ?? null

        if (lastSeenId === null) {
            if (currentId) {
                try {
                    localStorage.setItem(key, currentId)
                } catch {
                    /* localStorage no disponible — no rompe la UI */
                }
            }
            return
        }

        if (currentId && currentId !== lastSeenId && tierOrder(currentId) > tierOrder(lastSeenId)) {
            try {
                localStorage.setItem(key, currentId)
            } catch {
                /* no-op */
            }
            setFlourishing(true)
            useToastStore.getState().addToast('success', `¡${habitNombre} subió a ${tier!.nombre}!`)
            const timeout = setTimeout(() => setFlourishing(false), 1400)
            return () => clearTimeout(timeout)
        }
    }, [habitId, habitNombre, tier])

    return flourishing
}
