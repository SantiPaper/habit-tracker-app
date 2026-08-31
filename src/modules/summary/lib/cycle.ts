import { addDays, addMonths, parseISO, subDays } from 'date-fns'

import type { PeriodoTipo } from '@/modules/gamification/types/gamification.types'

export interface Cycle {
    index: number
    start: Date
    end: Date
}

function cycleStartFor(cycle0Start: Date, unit: PeriodoTipo, index: number): Date {
    return unit === 'semanal' ? addDays(cycle0Start, index * 7) : addMonths(cycle0Start, index)
}

function cycleEndFor(start: Date, unit: PeriodoTipo): Date {
    return unit === 'semanal' ? addDays(start, 6) : subDays(addMonths(start, 1), 1)
}

/** El ciclo (semana/mes rotativo, no de calendario) que contiene "today", anclado a fechaInicio del hábito. */
export function getCurrentCycle(fechaInicio: string, unit: PeriodoTipo, today: Date): Cycle {
    const cycle0Start = parseISO(fechaInicio)
    let index = 0
    let start = cycle0Start
    let end = cycleEndFor(start, unit)

    while (end < today) {
        index++
        start = cycleStartFor(cycle0Start, unit, index)
        end = cycleEndFor(start, unit)
    }

    return { index, start, end }
}

/** El ciclo inmediatamente anterior al que contiene "today", o null si el hábito está en su primer ciclo. */
export function getPreviousCycle(fechaInicio: string, unit: PeriodoTipo, today: Date): Cycle | null {
    const current = getCurrentCycle(fechaInicio, unit, today)
    if (current.index === 0) return null

    return getCycleAt(fechaInicio, unit, current.index - 1)
}

/** El ciclo N-ésimo (0-based) de un hábito, sin importar si ya cerró o no. */
export function getCycleAt(fechaInicio: string, unit: PeriodoTipo, index: number): Cycle {
    const cycle0Start = parseISO(fechaInicio)
    const start = cycleStartFor(cycle0Start, unit, index)
    const end = cycleEndFor(start, unit)

    return { index, start, end }
}
