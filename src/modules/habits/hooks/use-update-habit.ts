import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { EditableScheduleBlock } from '../components/schedule-blocks-editor'
import { replaceScheduleBlocksForHabit, toDomainScheduleBlock } from '../services/habit-schedule-block.service'
import { replaceHabitSchedule, updateHabitDetails } from '../services/habit.service'
import type { Habit } from '../types/habit.types'

import { habitsQueryKey } from './use-habits'

import { useToastStore } from '@/core/stores/toast-store'
import { toDateKey } from '@/lib/date/period'

export interface EditHabitInput {
    nombre: string
    diasSemana?: number[]
    scheduleBlocks?: EditableScheduleBlock[]
    fecha?: string
    hora?: string
    duracionMinutos?: number
    color?: string
    importancia: 'alta' | 'media' | 'baja'
}

export function diasSemanaChanged(current: number[] | null, next: number[] | undefined): boolean {
    const a = [...(current ?? [])].sort()
    const b = [...(next ?? [])].sort()
    return a.length !== b.length || a.some((value, i) => value !== b[i])
}

type EditHabitResult = { kind: 'updated'; habit: Habit } | { kind: 'replaced'; oldHabitId: string; habit: Habit }

async function editHabit(habit: Habit, input: EditHabitInput): Promise<EditHabitResult> {
    if (habit.tipo === 'diario_recurrente' && diasSemanaChanged(habit.diasSemana, input.diasSemana)) {
        // `replaceHabitSchedule` ya inserta los bloques nuevos (para el id nuevo) dentro de su
        // propia transacción y los devuelve mapeados — no hace falta un segundo sync acá.
        const newHabit = await replaceHabitSchedule(habit.id, toDateKey(new Date()), {
            tipo: 'diario_recurrente',
            nombre: input.nombre,
            diasSemana: input.diasSemana ?? [],
            scheduleBlocks: input.scheduleBlocks ?? [],
            color: input.color,
            importancia: input.importancia
        })
        return { kind: 'replaced', oldHabitId: habit.id, habit: newHabit }
    }

    const updated = await updateHabitDetails(habit.id, {
        nombre: input.nombre,
        fecha: habit.tipo === 'diario_unico' ? (input.fecha ?? null) : null,
        hora: habit.tipo === 'diario_recurrente' ? null : (input.hora ?? null),
        duracionMinutos: habit.tipo === 'diario_recurrente' ? null : (input.duracionMinutos ?? null),
        color: input.color ?? null,
        importancia: input.importancia
    })

    if (habit.tipo === 'diario_recurrente') {
        const rows = await replaceScheduleBlocksForHabit(habit.id, input.scheduleBlocks ?? [])
        return { kind: 'updated', habit: { ...updated, scheduleBlocks: rows.map(toDomainScheduleBlock) } }
    }

    return { kind: 'updated', habit: updated }
}

export function useUpdateHabit() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ habit, input }: { habit: Habit; input: EditHabitInput }) => editHabit(habit, input),
        onSuccess: result => {
            queryClient.setQueryData<Habit[]>(habitsQueryKey, current => {
                if (!current) return current
                if (result.kind === 'updated') {
                    return current.map(h => (h.id === result.habit.id ? result.habit : h))
                }
                return [...current.map(h => (h.id === result.oldHabitId ? { ...h, activo: false } : h)), result.habit]
            })
            useToastStore.getState().addToast('success', `Hábito "${result.habit.nombre}" actualizado`)
        },
        onError: error => {
            console.error('[update-habit] failed', error)
            const message = error instanceof Error ? error.message : String(error)
            useToastStore.getState().addToast('error', `No se pudo actualizar el hábito: ${message}`)
        }
    })
}
