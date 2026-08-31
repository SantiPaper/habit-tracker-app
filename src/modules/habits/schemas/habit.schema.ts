import { z } from 'zod'

const baseHabitSchema = {
    nombre: z.string().trim().min(1, 'El nombre es obligatorio'),
    color: z.string().optional(),
    importancia: z.enum(['alta', 'media', 'baja']).default('media')
}

/** Hora/duración escalares — solo para los tipos que NO son diario_recurrente (ese usa `scheduleBlocks`). */
const scalarScheduleFields = {
    hora: z.string().optional(),
    duracionMinutos: z.number().int().positive().optional()
}

export const habitScheduleBlockSchema = z.object({
    diasSemana: z.array(z.number().int().min(0).max(6)).min(1, 'Elegí al menos un día para este bloque'),
    hora: z.string().min(1, 'La hora es obligatoria'),
    duracionMinutos: z
        .number()
        .int()
        .positive()
        .nullable()
        .optional()
        .transform(v => v ?? null)
})

export const createHabitSchema = z.discriminatedUnion('tipo', [
    z.object({
        ...baseHabitSchema,
        tipo: z.literal('diario_recurrente'),
        diasSemana: z.array(z.number().int().min(0).max(6)).min(1, 'Elegí al menos un día'),
        scheduleBlocks: z.array(habitScheduleBlockSchema).default([])
    }),
    z.object({
        ...baseHabitSchema,
        ...scalarScheduleFields,
        tipo: z.literal('diario_unico'),
        fecha: z.string().min(1, 'La fecha es obligatoria')
    }),
    z.object({
        ...baseHabitSchema,
        ...scalarScheduleFields,
        tipo: z.literal('semanal')
    }),
    z.object({
        ...baseHabitSchema,
        ...scalarScheduleFields,
        tipo: z.literal('mensual')
    })
])

export type CreateHabitInput = z.infer<typeof createHabitSchema>
