import type { Habit } from '../types/habit.types'

import { toDateKey } from '@/lib/date/period'

export function isDueOnDate(habit: Habit, date: Date): boolean {
    if (!habit.activo) return false

    const dateKey = toDateKey(date)

    if (habit.tipo === 'diario_recurrente') {
        if (dateKey < habit.fechaInicio) return false
        if (habit.fechaFin && dateKey > habit.fechaFin) return false
        return habit.diasSemana?.includes(date.getDay()) ?? false
    }

    if (habit.tipo === 'diario_unico') {
        return habit.fecha === dateKey
    }

    return false
}
