import { useQuery } from '@tanstack/react-query'

import { computeStreak } from '@/modules/achievements/lib/streak'
import { fetchStreakLogs } from '@/modules/achievements/services/streak-logs.service'
import { listHabits } from '@/modules/habits/services/habit.service'

/**
 * La racha máxima más alta entre TODOS los hábitos recurrentes/semanales activos — el "titular"
 * que se comparte con amigos (no tiene sentido compartir la racha de un solo hábito puntual).
 * Mismo patrón que `use-next-milestones.ts`: un solo query que trae hábitos+logs y calcula todo
 * en JS, no un hook por hábito.
 */
export function useRachaMaxima() {
    return useQuery({
        queryKey: ['profile', 'racha-maxima'],
        queryFn: async (): Promise<number> => {
            const habits = await listHabits()
            const elegibles = habits.filter(h => h.activo && (h.tipo === 'diario_recurrente' || h.tipo === 'semanal'))
            const today = new Date()

            const maximas = await Promise.all(
                elegibles.map(async habit => {
                    const logs = await fetchStreakLogs(habit, today)
                    return computeStreak(habit, logs, today).maxima
                })
            )

            return maximas.length > 0 ? Math.max(...maximas) : 0
        }
    })
}
