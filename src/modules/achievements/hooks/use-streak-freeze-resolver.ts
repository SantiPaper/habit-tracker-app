import { startOfWeek, subDays } from 'date-fns'
import { useEffect, useRef } from 'react'

import { computeStreak } from '../lib/streak'
import {
    consumeFreezesForPeriodo,
    earnDueFreezes,
    isPeriodoResolved,
    listUnspentFreezes
} from '../services/streak-freeze.service'
import { fetchStreakLogs } from '../services/streak-logs.service'

import { toDateKey, toIsoWeekKey } from '@/lib/date/period'
import { getLogByPeriod, getLogsForHabitInRange, upsertHabitLog } from '@/modules/habits/services/habit-log.service'
import { listHabits } from '@/modules/habits/services/habit.service'
import type { Habit } from '@/modules/habits/types/habit.types'
import { getPreviousCycle } from '@/modules/summary/lib/cycle'
import { computeRollup } from '@/modules/summary/lib/rollup'

const CHECK_INTERVAL_MS = 60_000

/**
 * Cubre con un freeze el ciclo semanal recién cerrado de un `diario_recurrente`, si le faltaron
 * pocos días y tiene freezes sin gastar para cubrirlos exactamente — reescribe esos días como
 * `pausado` (reusa el estado que `computeRollup`/`computeStreak` ya tratan como "no cuenta, no
 * corta racha", sin tocar ninguna función pura) y marca esa cantidad de freezes como gastados.
 */
async function resolveRecurrente(habit: Habit, today: Date): Promise<void> {
    if (!habit.diasSemana || habit.diasSemana.length === 0) return

    const previous = getPreviousCycle(habit.fechaInicio, 'semanal', today)
    if (!previous) return

    const periodo = toDateKey(previous.start)
    if (await isPeriodoResolved(habit.id, periodo)) return

    const logs = await getLogsForHabitInRange(habit.id, toDateKey(previous.start), toDateKey(previous.end))
    const rollup = computeRollup(habit, logs, previous.start, previous.end, today)
    if (rollup.perfecto || rollup.diasFaltantes.length === 0) return

    const unspent = await listUnspentFreezes(habit.id)
    if (unspent.length < rollup.diasFaltantes.length) return

    for (const dateKey of rollup.diasFaltantes) {
        await upsertHabitLog(habit.id, dateKey, 'pausado')
    }
    await consumeFreezesForPeriodo(habit.id, periodo, rollup.diasFaltantes.length)
}

/** Mismo mecanismo que `resolveRecurrente`, pero para `semanal` — acá el período entero es un único check, así que cubrirlo siempre gasta exactamente 1 freeze. */
async function resolveSemanal(habit: Habit, today: Date): Promise<void> {
    const previousWeekAnchor = subDays(startOfWeek(today, { weekStartsOn: 1 }), 1)
    if (toDateKey(previousWeekAnchor) < habit.fechaInicio) return

    const periodo = toIsoWeekKey(previousWeekAnchor)
    if (await isPeriodoResolved(habit.id, periodo)) return

    const log = await getLogByPeriod(habit.id, periodo)
    if (log && (log.estado === 'cumplido' || log.estado === 'pausado')) return

    const unspent = await listUnspentFreezes(habit.id)
    if (unspent.length < 1) return

    await upsertHabitLog(habit.id, periodo, 'pausado')
    await consumeFreezesForPeriodo(habit.id, periodo, 1)
}

async function resolveHabit(habit: Habit, today: Date): Promise<void> {
    if (habit.tipo === 'diario_recurrente') await resolveRecurrente(habit, today)
    else if (habit.tipo === 'semanal') await resolveSemanal(habit, today)
    else return

    // Recién después de resolver (el freeze recién gastado puede haber extendido la racha) se
    // chequea si corresponde ganar uno nuevo — así no queda desfasado un chequeo diario de atraso.
    const logs = await fetchStreakLogs(habit, today)
    const { actual } = computeStreak(habit, logs, today)
    await earnDueFreezes(habit.id, actual)
}

/**
 * Corre una vez por día (no en cada render — el trabajo es real: puede escribir `habit_log` y
 * `habit_streak_freeze`), para cada hábito `diario_recurrente`/`semanal` activo: gasta freezes
 * disponibles en el ciclo/período recién cerrado si le faltó poco, y gana los que correspondan
 * según la racha resultante. Silencioso ante errores — es un agregado de gamificación, nunca debe
 * poder romper el uso normal de la app si algo falla.
 */
export function useStreakFreezeResolver() {
    const lastRunRef = useRef<string | null>(null)

    useEffect(() => {
        async function runIfNewDay() {
            const today = new Date()
            const todayKey = toDateKey(today)
            if (lastRunRef.current === todayKey) return
            lastRunRef.current = todayKey

            try {
                const habits = await listHabits()
                const eligible = habits.filter(
                    h => h.activo && (h.tipo === 'diario_recurrente' || h.tipo === 'semanal')
                )
                for (const habit of eligible) {
                    await resolveHabit(habit, today)
                }
            } catch (error) {
                console.error('[streak-freeze-resolver] failed', error)
            }
        }

        void runIfNewDay()
        const interval = setInterval(() => void runIfNewDay(), CHECK_INTERVAL_MS)
        return () => clearInterval(interval)
    }, [])
}
