import { sql } from 'kysely'

import { toDomainEvent } from './event.mappers'

import { db } from '@/core/db/client'
import { useSessionStore } from '@/modules/account/store/session-store'
import type { Event } from '@/modules/events/types/event.types'

/** Mismo patrón que `habit.service.ts` — los eventos son exclusivos de la cuenta activa en este dispositivo. */
function currentOwnerId(): string | null {
    return useSessionStore.getState().session?.userId ?? null
}

export async function listEvents(): Promise<Event[]> {
    const ownerId = currentOwnerId()
    if (!ownerId) return []

    const rows = await db
        .selectFrom('event')
        .selectAll()
        .where('owner_user_id', '=', ownerId)
        .orderBy('fecha', 'asc')
        .execute()
    return rows.map(toDomainEvent)
}

export async function getEventsForDate(dateKey: string): Promise<Event[]> {
    const ownerId = currentOwnerId()
    if (!ownerId) return []

    const rows = await db
        .selectFrom('event')
        .selectAll()
        .where('fecha', '=', dateKey)
        .where('owner_user_id', '=', ownerId)
        .orderBy('nombre', 'asc')
        .execute()
    return rows.map(toDomainEvent)
}

export async function listEventsInRange(fromKey: string, toKey: string): Promise<Event[]> {
    const ownerId = currentOwnerId()
    if (!ownerId) return []

    const rows = await db
        .selectFrom('event')
        .selectAll()
        .where('fecha', '>=', fromKey)
        .where('fecha', '<=', toKey)
        .where('owner_user_id', '=', ownerId)
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
    const ownerId = currentOwnerId()
    if (!ownerId) throw new Error('Necesitás una cuenta para crear eventos')

    const row = await db
        .insertInto('event')
        .values({
            id: crypto.randomUUID(),
            nombre: input.nombre,
            fecha: input.fecha,
            notas: input.notas ?? null,
            owner_user_id: ownerId
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
    const ownerId = currentOwnerId()
    if (!ownerId) throw new Error('Necesitás una cuenta para editar eventos')

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
        .where('owner_user_id', '=', ownerId)
        .returningAll()
        .executeTakeFirstOrThrow()
    return toDomainEvent(row)
}

export async function deleteEvent(eventId: string): Promise<void> {
    const ownerId = currentOwnerId()
    if (!ownerId) throw new Error('Necesitás una cuenta para borrar eventos')

    await db.deleteFrom('event').where('id', '=', eventId).where('owner_user_id', '=', ownerId).execute()
}
