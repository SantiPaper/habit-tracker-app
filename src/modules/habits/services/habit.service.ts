import type { CreateHabitInput } from '../schemas/habit.schema'
import type { Habit, HabitTipo } from '../types/habit.types'

import {
    apiCreateHabit,
    apiListHabits,
    apiReplaceHabit,
    apiUpdateHabit,
    type CreateHabitBody
} from './habit-api.service'
import { toDomainHabit } from './habit.mappers'

import { toDateKey } from '@/lib/date/period'
import { useSessionStore } from '@/modules/account/store/session-store'

/**
 * Etapa 2 de la migración a la nube: este módulo dejó de leer/escribir SQLite local — todo pasa
 * por `habit-api.service.ts` contra el server (ver habit-tracker-server, modelo `Habit`). El
 * contrato público (nombres, firmas, el tipo de dominio `Habit`) no cambió — los ~15 hooks que
 * llaman estas funciones no se tocaron.
 */
function requireSession(): void {
    if (!useSessionStore.getState().session) throw new Error('Necesitás una cuenta para crear/editar hábitos')
}

function toCreateBody(input: CreateHabitInput, fechaInicio: string): CreateHabitBody {
    return {
        nombre: input.nombre,
        tipo: input.tipo,
        diasSemana: input.tipo === 'diario_recurrente' ? JSON.stringify(input.diasSemana) : null,
        fecha: input.tipo === 'diario_unico' ? input.fecha : null,
        hora: input.tipo === 'diario_recurrente' ? null : (input.hora ?? null),
        duracionMinutos: input.tipo === 'diario_recurrente' ? null : (input.duracionMinutos ?? null),
        color: input.color ?? null,
        importancia: input.importancia,
        fechaInicio,
        scheduleBlocks:
            input.tipo === 'diario_recurrente'
                ? input.scheduleBlocks.map(b => ({
                      diasSemana: JSON.stringify(b.diasSemana),
                      hora: b.hora,
                      duracionMinutos: b.duracionMinutos
                  }))
                : undefined
    }
}

export async function listHabits(): Promise<Habit[]> {
    if (!useSessionStore.getState().session) return []
    const rows = await apiListHabits()
    return rows.sort((a, b) => a.createdAt.localeCompare(b.createdAt)).map(toDomainHabit)
}

export interface PastUnicoHabit {
    nombre: string
    color: string | null
    importancia: Habit['importancia']
}

/**
 * Nombres de hábitos `diario_unico` ya creados antes (deduplicados, el más reciente de cada
 * nombre) — antes era una query dedicada a SQLite, ahora se filtra en JS a partir de la lista
 * completa (el server no expone un endpoint aparte para esto, no vale la pena uno solo para esta
 * pantalla — la cantidad de hábitos de una cuenta es chica).
 */
export async function listPastUnicoHabitNames(): Promise<PastUnicoHabit[]> {
    const habits = await listHabits()
    const unicos = habits
        .filter(h => h.tipo === 'diario_unico')
        .sort((a, b) => b.fechaInicio.localeCompare(a.fechaInicio))

    const seen = new Set<string>()
    const result: PastUnicoHabit[] = []
    for (const habit of unicos) {
        if (seen.has(habit.nombre)) continue
        seen.add(habit.nombre)
        result.push({ nombre: habit.nombre, color: habit.color, importancia: habit.importancia })
    }
    return result
}

export async function listActiveHabitsByTipo(tipo: HabitTipo): Promise<Habit[]> {
    const habits = await listHabits()
    return habits.filter(h => h.tipo === tipo && h.activo)
}

export async function createHabit(input: CreateHabitInput): Promise<Habit> {
    requireSession()
    const today = toDateKey(new Date())
    const row = await apiCreateHabit(toCreateBody(input, today))
    return toDomainHabit(row)
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
    requireSession()
    const row = await apiUpdateHabit(habitId, {
        nombre: changes.nombre,
        fecha: changes.fecha ?? null,
        hora: changes.hora ?? null,
        duracionMinutos: changes.duracionMinutos ?? null,
        color: changes.color ?? null,
        ...(changes.importancia ? { importancia: changes.importancia } : {})
    })
    return toDomainHabit(row)
}

export async function retireHabit(habitId: string, fechaFin: string): Promise<void> {
    requireSession()
    await apiUpdateHabit(habitId, { fechaFin, activo: false })
}

export async function replaceHabitSchedule(
    oldHabitId: string,
    fechaFin: string,
    newHabit: CreateHabitInput
): Promise<Habit> {
    requireSession()
    const today = toDateKey(new Date())
    const row = await apiReplaceHabit(oldHabitId, fechaFin, toCreateBody(newHabit, today))
    return toDomainHabit(row)
}
