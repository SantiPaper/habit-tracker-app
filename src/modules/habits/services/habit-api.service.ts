import { apiRequest } from '@/modules/account/services/api-client'
import type { HabitImportancia, HabitTipo } from '@/modules/habits/types/habit.types'

/**
 * Forma cruda tal como la devuelve el server — `diasSemana` (del hábito Y de cada bloque) viaja
 * como string JSON, igual que se guardaba en la columna `dias_semana` de SQLite local. La
 * conversión a `number[]` para el tipo de dominio (`Habit`) pasa por `habit.mappers.ts`, no acá.
 */
export interface ApiScheduleBlock {
    id: string
    habitId: string
    diasSemana: string
    hora: string
    duracionMinutos: number | null
}

export interface ApiHabit {
    id: string
    userId: string
    nombre: string
    tipo: HabitTipo
    diasSemana: string | null
    fecha: string | null
    hora: string | null
    duracionMinutos: number | null
    color: string | null
    importancia: HabitImportancia
    fechaInicio: string
    fechaFin: string | null
    activo: boolean
    createdAt: string
    updatedAt: string
    scheduleBlocks: ApiScheduleBlock[]
}

export interface ApiScheduleBlockInput {
    diasSemana: string
    hora: string
    duracionMinutos?: number | null
}

export interface CreateHabitBody {
    nombre: string
    tipo: HabitTipo
    diasSemana?: string | null
    fecha?: string | null
    hora?: string | null
    duracionMinutos?: number | null
    color?: string | null
    importancia: HabitImportancia
    fechaInicio: string
    scheduleBlocks?: ApiScheduleBlockInput[]
}

export interface UpdateHabitBody {
    nombre?: string
    fecha?: string | null
    hora?: string | null
    duracionMinutos?: number | null
    color?: string | null
    importancia?: HabitImportancia
    activo?: boolean
    fechaFin?: string | null
    scheduleBlocks?: ApiScheduleBlockInput[]
}

export function apiListHabits() {
    return apiRequest<ApiHabit[]>('/habits')
}

export function apiCreateHabit(body: CreateHabitBody) {
    return apiRequest<ApiHabit>('/habits', { method: 'POST', body })
}

export function apiUpdateHabit(habitId: string, body: UpdateHabitBody) {
    return apiRequest<ApiHabit>(`/habits/${habitId}`, { method: 'PATCH', body })
}

export function apiReplaceHabit(oldHabitId: string, fechaFin: string, habit: CreateHabitBody) {
    return apiRequest<ApiHabit>(`/habits/${oldHabitId}/replace`, { method: 'POST', body: { fechaFin, habit } })
}
