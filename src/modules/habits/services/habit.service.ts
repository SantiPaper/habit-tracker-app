import type { Selectable } from 'kysely'

import type { CreateHabitInput } from '../schemas/habit.schema'
import type { Habit, HabitTipo } from '../types/habit.types'

import { replaceScheduleBlocksForHabit, listAllScheduleBlocks } from './habit-schedule-block.service'
import { toDomainHabit } from './habit.mappers'

import { db } from '@/core/db/client'
import type { HabitScheduleBlockTable } from '@/core/db/schema'
import { toDateKey } from '@/lib/date/period'

function groupBlocksByHabitId(
    blocks: Selectable<HabitScheduleBlockTable>[]
): Map<string, Selectable<HabitScheduleBlockTable>[]> {
    const map = new Map<string, Selectable<HabitScheduleBlockTable>[]>()
    for (const block of blocks) {
        const group = map.get(block.habit_id)
        if (group) group.push(block)
        else map.set(block.habit_id, [block])
    }
    return map
}

export async function listHabits(): Promise<Habit[]> {
    const [rows, blocks] = await Promise.all([
        db.selectFrom('habit').selectAll().orderBy('created_at', 'asc').execute(),
        listAllScheduleBlocks()
    ])
    const blocksByHabitId = groupBlocksByHabitId(blocks)
    return rows.map(row => toDomainHabit(row, blocksByHabitId.get(row.id) ?? []))
}

export async function listActiveHabitsByTipo(tipo: HabitTipo): Promise<Habit[]> {
    const [rows, blocks] = await Promise.all([
        db
            .selectFrom('habit')
            .selectAll()
            .where('tipo', '=', tipo)
            .where('activo', '=', 1)
            .orderBy('created_at', 'asc')
            .execute(),
        tipo === 'diario_recurrente' ? listAllScheduleBlocks() : Promise.resolve([])
    ])
    const blocksByHabitId = groupBlocksByHabitId(blocks)
    return rows.map(row => toDomainHabit(row, blocksByHabitId.get(row.id) ?? []))
}

export async function createHabit(input: CreateHabitInput): Promise<Habit> {
    const id = crypto.randomUUID()
    const today = toDateKey(new Date())

    return db.transaction().execute(async trx => {
        const row = await trx
            .insertInto('habit')
            .values({
                id,
                nombre: input.nombre,
                tipo: input.tipo,
                dias_semana: input.tipo === 'diario_recurrente' ? JSON.stringify(input.diasSemana) : null,
                fecha: input.tipo === 'diario_unico' ? input.fecha : null,
                hora: input.tipo === 'diario_recurrente' ? null : (input.hora ?? null),
                duracion_minutos: input.tipo === 'diario_recurrente' ? null : (input.duracionMinutos ?? null),
                color: input.color ?? null,
                importancia: input.importancia,
                fecha_inicio: today,
                fecha_fin: null,
                activo: 1
            })
            .returningAll()
            .executeTakeFirstOrThrow()

        const blocks =
            input.tipo === 'diario_recurrente' ? await replaceScheduleBlocksForHabit(id, input.scheduleBlocks, trx) : []

        return toDomainHabit(row, blocks)
    })
}

export interface UpdateHabitDetailsInput {
    nombre: string
    fecha?: string | null
    hora?: string | null
    duracionMinutos?: number | null
    color?: string | null
    importancia?: 'alta' | 'media' | 'baja'
}

export async function updateHabitDetails(habitId: string, changes: UpdateHabitDetailsInput): Promise<Habit> {
    const row = await db
        .updateTable('habit')
        .set({
            nombre: changes.nombre,
            fecha: changes.fecha ?? null,
            hora: changes.hora ?? null,
            duracion_minutos: changes.duracionMinutos ?? null,
            color: changes.color ?? null,
            ...(changes.importancia ? { importancia: changes.importancia } : {})
        })
        .where('id', '=', habitId)
        .returningAll()
        .executeTakeFirstOrThrow()

    // `scheduleBlocks` no se toca acá — para diario_recurrente el caller (`editHabit`) sincroniza
    // los bloques por separado con `replaceScheduleBlocksForHabit` y arma el resultado final.
    return toDomainHabit(row, [])
}

export async function retireHabit(habitId: string, fechaFin: string): Promise<void> {
    await db.updateTable('habit').set({ fecha_fin: fechaFin, activo: 0 }).where('id', '=', habitId).execute()
}

export async function replaceHabitSchedule(
    oldHabitId: string,
    fechaFin: string,
    newHabit: CreateHabitInput
): Promise<Habit> {
    return db.transaction().execute(async trx => {
        await trx.updateTable('habit').set({ fecha_fin: fechaFin, activo: 0 }).where('id', '=', oldHabitId).execute()

        const id = crypto.randomUUID()
        const today = toDateKey(new Date())

        const row = await trx
            .insertInto('habit')
            .values({
                id,
                nombre: newHabit.nombre,
                tipo: newHabit.tipo,
                dias_semana: newHabit.tipo === 'diario_recurrente' ? JSON.stringify(newHabit.diasSemana) : null,
                fecha: newHabit.tipo === 'diario_unico' ? newHabit.fecha : null,
                hora: newHabit.tipo === 'diario_recurrente' ? null : (newHabit.hora ?? null),
                duracion_minutos: newHabit.tipo === 'diario_recurrente' ? null : (newHabit.duracionMinutos ?? null),
                color: newHabit.color ?? null,
                importancia: newHabit.importancia,
                fecha_inicio: today,
                fecha_fin: null,
                activo: 1
            })
            .returningAll()
            .executeTakeFirstOrThrow()

        const blocks =
            newHabit.tipo === 'diario_recurrente'
                ? await replaceScheduleBlocksForHabit(id, newHabit.scheduleBlocks, trx)
                : []

        return toDomainHabit(row, blocks)
    })
}
