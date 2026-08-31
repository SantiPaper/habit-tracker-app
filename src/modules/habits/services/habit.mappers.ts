import type { Selectable } from 'kysely'

import type { Habit } from '../types/habit.types'

import { toDomainScheduleBlock } from './habit-schedule-block.service'

import type { HabitScheduleBlockTable, HabitTable } from '@/core/db/schema'

export function toDomainHabit(row: Selectable<HabitTable>, blocks: Selectable<HabitScheduleBlockTable>[] = []): Habit {
    return {
        id: row.id,
        nombre: row.nombre,
        tipo: row.tipo,
        diasSemana: row.dias_semana ? (JSON.parse(row.dias_semana) as number[]) : null,
        fecha: row.fecha,
        hora: row.hora,
        duracionMinutos: row.duracion_minutos,
        scheduleBlocks: blocks.map(toDomainScheduleBlock),
        color: row.color,
        importancia: row.importancia,
        fechaInicio: row.fecha_inicio,
        fechaFin: row.fecha_fin,
        activo: row.activo === 1
    }
}
