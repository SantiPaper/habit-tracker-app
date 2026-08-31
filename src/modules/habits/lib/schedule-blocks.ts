import type { Habit } from '../types/habit.types'

export interface ScheduleSlot {
    hora: string
    duracionMinutos: number | null
}

/**
 * Los bloques de horario de un hábito que aplican a una fecha puntual — el corazón de cómo la
 * Agenda dibuja hábitos con horario. Para tipos que no son `diario_recurrente`, es compatible con
 * el único `hora`/`duracionMinutos` escalar de siempre. Para `diario_recurrente`, filtra
 * `scheduleBlocks` por los que incluyen el día de la semana de `date`, ordenados por hora — un
 * hábito puede devolver 0 (sin horario), 1 (caso común) o varios (ej. un corte en el medio del día).
 */
export function getBlocksForDate(habit: Habit, date: Date): ScheduleSlot[] {
    if (habit.tipo !== 'diario_recurrente') {
        return habit.hora ? [{ hora: habit.hora, duracionMinutos: habit.duracionMinutos }] : []
    }

    const dayOfWeek = date.getDay()
    return habit.scheduleBlocks
        .filter(block => block.diasSemana.includes(dayOfWeek))
        .map(block => ({ hora: block.hora, duracionMinutos: block.duracionMinutos }))
        .sort((a, b) => a.hora.localeCompare(b.hora))
}
