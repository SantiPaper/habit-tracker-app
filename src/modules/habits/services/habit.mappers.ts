import { toDomainScheduleBlock } from './habit-schedule-block.service'

import type { ApiHabit } from '@/modules/habits/services/habit-api.service'
import type { Habit } from '@/modules/habits/types/habit.types'

export function toDomainHabit(row: ApiHabit): Habit {
    return {
        id: row.id,
        nombre: row.nombre,
        tipo: row.tipo,
        diasSemana: row.diasSemana ? (JSON.parse(row.diasSemana) as number[]) : null,
        fecha: row.fecha,
        hora: row.hora,
        duracionMinutos: row.duracionMinutos,
        scheduleBlocks: row.scheduleBlocks.map(toDomainScheduleBlock),
        color: row.color,
        importancia: row.importancia,
        fechaInicio: row.fechaInicio,
        fechaFin: row.fechaFin,
        activo: row.activo
    }
}
