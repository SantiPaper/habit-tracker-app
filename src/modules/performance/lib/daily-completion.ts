import { toDateKey } from '@/lib/date/period'
import { isDueOnDate } from '@/modules/habits/lib/is-due-on-date'
import type { HabitLog } from '@/modules/habits/types/habit-log.types'
import type { Habit } from '@/modules/habits/types/habit.types'

export interface DailyCompletion {
    dateKey: string
    programados: number
    cumplidos: number
    /** `null` = no había nada programado ese día — distinto de "0% cumplido". */
    pct: number | null
}

/** Solo cuentan los tipos con un check por día real — `semanal`/`mensual` no tienen granularidad diaria. */
const DAILY_TIPOS: Habit['tipo'][] = ['diario_recurrente', 'diario_unico']

/**
 * % de hábitos de control diario cumplidos, por día — mismo criterio que `computeRollup` para
 * `pausado` (no cuenta ni a favor ni en contra, se excluye del total) para que un día cubierto por
 * una racha protegida (etapa 5, se guarda como `pausado`) no le baje el promedio a nadie.
 */
export function computeDailyCompletion(days: Date[], habits: Habit[], logs: HabitLog[]): DailyCompletion[] {
    const eligible = habits.filter(h => h.activo && DAILY_TIPOS.includes(h.tipo))
    const estadoByKey = new Map(logs.map(log => [`${log.habitId}|${log.periodo}`, log.estado]))

    return days.map(day => {
        const dateKey = toDateKey(day)
        const due = eligible.filter(h => isDueOnDate(h, day))
        const active = due.filter(h => estadoByKey.get(`${h.id}|${dateKey}`) !== 'pausado')
        const cumplidos = active.filter(h => estadoByKey.get(`${h.id}|${dateKey}`) === 'cumplido').length

        return {
            dateKey,
            programados: active.length,
            cumplidos,
            pct: active.length > 0 ? Math.round((cumplidos / active.length) * 100) : null
        }
    })
}
