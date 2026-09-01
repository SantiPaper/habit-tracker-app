import { sql } from 'kysely'

import { toDomainEvent } from './event.mappers'

import { db } from '@/core/db/client'
import type { Event } from '@/modules/events/types/event.types'

export async function listEvents(): Promise<Event[]> {
    const rows = await db.selectFrom('event').selectAll().orderBy('fecha', 'asc').execute()
    return rows.map(toDomainEvent)
}

export async function getEventsForDate(dateKey: string): Promise<Event[]> {
    const rows = await db
        .selectFrom('event')
        .selectAll()
        .where('fecha', '=', dateKey)
        .orderBy('nombre', 'asc')
        .execute()
    return rows.map(toDomainEvent)
}

export async function listEventsInRange(fromKey: string, toKey: string): Promise<Event[]> {
    const rows = await db
        .selectFrom('event')
        .selectAll()
        .where('fecha', '>=', fromKey)
        .where('fecha', '<=', toKey)
        .orderBy('fecha', 'asc')
        .execute()
    return rows.map(toDomainEvent)
}

export interface CreateEventInput {
    nombre: string
    fecha: string
    notas?: string | null
}

export async function createEvent(input: CreateEventInput): Promise<Event> {
    const row = await db
        .insertInto('event')
        .values({
            id: crypto.randomUUID(),
            nombre: input.nombre,
            fecha: input.fecha,
            notas: input.notas ?? null
        })
        .returningAll()
        .executeTakeFirstOrThrow()
    return toDomainEvent(row)
}

export interface UpdateEventInput {
    nombre: string
    fecha: string
    notas?: string | null
}

export async function updateEvent(eventId: string, changes: UpdateEventInput): Promise<Event> {
    const row = await db
        .updateTable('event')
        .set({
            nombre: changes.nombre,
            fecha: changes.fecha,
            notas: changes.notas ?? null,
            // Mismo cuidado que en `habit.service.ts`: el default de la columna solo aplica al
            // INSERT — sin esto, `updated_at` quedaría congelado en la fecha de creación.
            updated_at: sql`datetime('now')`
        })
        .where('id', '=', eventId)
        .returningAll()
        .executeTakeFirstOrThrow()
    return toDomainEvent(row)
}

export async function deleteEvent(eventId: string): Promise<void> {
    await db.deleteFrom('event').where('id', '=', eventId).execute()
}
