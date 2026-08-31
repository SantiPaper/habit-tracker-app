import { eachMonthOfInterval, eachWeekOfInterval, parseISO } from 'date-fns'

import { toIsoMonthKey, toIsoWeekKey } from '@/lib/date/period'
import type { HabitLog } from '@/modules/habits/types/habit-log.types'
import type { Habit } from '@/modules/habits/types/habit.types'
import { getCurrentCycle, getCycleAt } from '@/modules/summary/lib/cycle'
import { computeRollup } from '@/modules/summary/lib/rollup'

export interface StreakResult {
    /** Racha en curso, contando hacia atrás desde el último período cerrado. */
    actual: number
    /** Racha más larga que tuvo el hábito alguna vez — un logro desbloqueado nunca se "pierde". */
    maxima: number
}

/**
 * Punto de entrada público: la racha de un hábito, según su tipo.
 * - `diario_recurrente`: semanas perfectas (ciclo rotativo semanal, ver `computeRecurrenteStreak`).
 * - `semanal`: mismo criterio de "semanas seguidas" pero sin días que descomponer — cada semana
 *   es un único check, ver `computePeriodStreak`.
 * - cualquier otro tipo (`diario_unico`, `mensual`): sin racha en este sentido — `mensual` tiene
 *   su propio mecanismo de XP escalado (`computePeriodStreak` con `unit: 'mensual'`, usado
 *   directamente desde el módulo de Resumen, no desde acá).
 */
export function computeStreak(habit: Habit, logs: HabitLog[], today: Date): StreakResult {
    if (habit.tipo === 'diario_recurrente') return computeRecurrenteStreak(habit, logs, today)
    if (habit.tipo === 'semanal') return computePeriodStreak(habit, logs, 'semanal', today)
    return { actual: 0, maxima: 0 }
}

/**
 * Racha de **semanas perfectas** (ciclo rotativo semanal, anclado a `fechaInicio`) consecutivas.
 * Se mide en semanas y no en ocurrencias sueltas a propósito: un hábito de 1 vez por semana y uno
 * de 6 veces por semana tienen el mismo mérito por una semana perfecta, aunque el segundo tenga
 * muchas más ocurrencias — contar ocurrencias premiaría solo la frecuencia, no la constancia.
 */
function computeRecurrenteStreak(habit: Habit, logs: HabitLog[], today: Date): StreakResult {
    if (!habit.diasSemana || habit.diasSemana.length === 0) return { actual: 0, maxima: 0 }

    const current = getCurrentCycle(habit.fechaInicio, 'semanal', today)
    const closedCycles = current.index // el ciclo actual (índice `current.index`) siempre está en curso, nunca cuenta

    let maxima = 0
    let running = 0

    for (let index = 0; index < closedCycles; index++) {
        const cycle = getCycleAt(habit.fechaInicio, 'semanal', index)
        const rollup = computeRollup(habit, logs, cycle.start, cycle.end, today)

        if (rollup.perfecto) {
            running++
            maxima = Math.max(maxima, running)
        } else {
            running = 0
        }
    }

    return { actual: running, maxima }
}

/**
 * Racha de períodos (semana o mes) consecutivos con `estado === 'cumplido'`, para hábitos
 * `semanal`/`mensual` — no se descomponen en días, cada período es un único check tri-estado.
 * El período en curso nunca cuenta (mismo criterio que `computeRecurrenteStreak`: solo períodos
 * ya cerrados). Un `pausado` no suma ni corta la racha. Usada tanto para el sistema de ligas de
 * `semanal` (vía `computeStreak`) como para el XP escalado de `mensual` (llamada directo desde
 * `summary`, con `unit: 'mensual'` — mensual no entra a las ligas, ver plan de esta feature).
 */
export function computePeriodStreak(
    habit: Habit,
    logs: HabitLog[],
    unit: 'semanal' | 'mensual',
    today: Date
): StreakResult {
    const start = parseISO(habit.fechaInicio)
    const periods =
        unit === 'semanal'
            ? eachWeekOfInterval({ start, end: today }, { weekStartsOn: 1 })
            : eachMonthOfInterval({ start, end: today })
    const toKey = unit === 'semanal' ? toIsoWeekKey : toIsoMonthKey

    const todayKey = toKey(today)
    const estadoByPeriodo = new Map(logs.map(log => [log.periodo, log.estado]))

    let maxima = 0
    let running = 0

    for (const period of periods) {
        const key = toKey(period)
        if (key === todayKey) break // el período en curso nunca cuenta

        const estado = estadoByPeriodo.get(key)
        if (estado === 'pausado') continue
        if (estado === 'cumplido') {
            running++
            maxima = Math.max(maxima, running)
        } else {
            running = 0
        }
    }

    return { actual: running, maxima }
}
