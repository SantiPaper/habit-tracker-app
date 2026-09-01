import { differenceInCalendarDays } from 'date-fns'

import { toDateKey } from '@/lib/date/period'
import type { HabitLog } from '@/modules/habits/types/habit-log.types'
import type { Habit } from '@/modules/habits/types/habit.types'

export interface RollupResult {
    programados: number
    cumplidos: number
    pausados: number
    perfecto: boolean
    /** Si "today" ya pasó el final del período — un período en curso nunca es reclamable. */
    cicloTerminado: boolean
    /** Días que faltan para que este ciclo cierre y pase a ser reclamable (si termina perfecto). */
    diasRestantes: number
    /** Fechas (`YYYY-MM-DD`) programadas que no llegaron a `cumplido` — usado por la racha protegida
     * (etapa 5) para decidir cuántos días puede cubrir un freeze en este ciclo. */
    diasFaltantes: string[]
}

export function computeRollup(
    habit: Habit,
    logs: HabitLog[],
    periodStart: Date,
    periodEnd: Date,
    today: Date
): RollupResult {
    const cicloTerminado = today > periodEnd
    const clampedEnd = periodEnd < today ? periodEnd : today
    const estadoByDate = new Map(logs.map(log => [log.periodo, log.estado]))

    let programados = 0
    let cumplidos = 0
    let pausados = 0
    const diasFaltantes: string[] = []

    for (const day = new Date(periodStart); day <= clampedEnd; day.setDate(day.getDate() + 1)) {
        if (!habit.diasSemana?.includes(day.getDay())) continue

        const dateKey = toDateKey(day)
        if (dateKey < habit.fechaInicio) continue
        if (habit.fechaFin && dateKey > habit.fechaFin) continue

        const estado = estadoByDate.get(dateKey)
        if (estado === 'pausado') {
            pausados++
            continue
        }

        programados++
        if (estado === 'cumplido') cumplidos++
        else diasFaltantes.push(dateKey)
    }

    return {
        programados,
        cumplidos,
        pausados,
        perfecto: programados > 0 && cumplidos === programados,
        cicloTerminado,
        diasRestantes: Math.max(0, differenceInCalendarDays(periodEnd, today)),
        diasFaltantes
    }
}
