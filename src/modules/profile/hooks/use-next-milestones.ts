import { useQuery } from '@tanstack/react-query'

import { computeStreak } from '@/modules/achievements/lib/streak'
import { nextMilestoneFor } from '@/modules/achievements/lib/tiers'
import { fetchStreakLogs } from '@/modules/achievements/services/streak-logs.service'
import { listHabits } from '@/modules/habits/services/habit.service'

export interface NextMilestoneItem {
    habitId: string
    habitNombre: string
    maxima: number
    milestone: number
    tierNombre: string
    tierAccent: string
    semanasFaltantes: number
}

const MAX_ITEMS = 5

/**
 * Los próximos hitos de racha más cercanos a desbloquear, entre todos los hábitos recurrentes y
 * semanales activos — ordenado por "cuánto falta", el más próximo primero. Un solo query que trae
 * hábitos + logs y calcula todo en JS (no un hook por hábito), para no violar las reglas de hooks
 * al armar una lista dinámica.
 */
export function useNextMilestones() {
    return useQuery({
        queryKey: ['profile', 'next-milestones'],
        queryFn: async (): Promise<NextMilestoneItem[]> => {
            const habits = await listHabits()
            const elegibles = habits.filter(h => h.activo && (h.tipo === 'diario_recurrente' || h.tipo === 'semanal'))
            const today = new Date()

            const items = await Promise.all(
                elegibles.map(async (habit): Promise<NextMilestoneItem | null> => {
                    const logs = await fetchStreakLogs(habit, today)
                    const streak = computeStreak(habit, logs, today)
                    const next = nextMilestoneFor(streak.maxima)
                    if (!next) return null // ya está en Hábito Atómico, sin próximo hito fijo

                    return {
                        habitId: habit.id,
                        habitNombre: habit.nombre,
                        maxima: streak.maxima,
                        milestone: next.milestone,
                        tierNombre: next.tier.nombre,
                        tierAccent: next.tier.accent,
                        semanasFaltantes: next.milestone - streak.maxima
                    }
                })
            )

            return items
                .filter((item): item is NextMilestoneItem => item !== null)
                .sort((a, b) => a.semanasFaltantes - b.semanasFaltantes)
                .slice(0, MAX_ITEMS)
        }
    })
}
