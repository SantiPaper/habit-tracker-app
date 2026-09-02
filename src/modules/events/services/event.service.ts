import { apiCreateEvent, apiDeleteEvent, apiListEvents, apiUpdateEvent } from './event-api.service'
import { toDomainEvent } from './event.mappers'

import { useSessionStore } from '@/modules/account/store/session-store'
import type { Event } from '@/modules/events/types/event.types'

/** Etapa 2 de la migración a la nube (dominio 3) — mismo patrón que habit.service.ts: contrato público sin cambios, ahora contra la API. */
function requireSession(): void {
    if (!useSessionStore.getState().session) throw new Error('Necesitás una cuenta para editar eventos')
}

export async function listEvents(): Promise<Event[]> {
    if (!useSessionStore.getState().session) return []
    const rows = await apiListEvents()
    return rows.sort((a, b) => a.fecha.localeCompare(b.fecha)).map(toDomainEvent)
}

export async function getEventsForDate(dateKey: string): Promise<Event[]> {
    const events = await listEvents()
    return events.filter(e => e.fecha === dateKey).sort((a, b) => a.nombre.localeCompare(b.nombre))
}

export async function listEventsInRange(fromKey: string, toKey: string): Promise<Event[]> {
    const events = await listEvents()
    return events.filter(e => e.fecha >= fromKey && e.fecha <= toKey)
}

export interface CreateEventInput {
    nombre: string
    fecha: string
    notas?: string | null
}

export async function createEvent(input: CreateEventInput): Promise<Event> {
    requireSession()
    const row = await apiCreateEvent({ nombre: input.nombre, fecha: input.fecha, notas: input.notas ?? null })
    return toDomainEvent(row)
}

export interface UpdateEventInput {
    nombre: string
    fecha: string
    notas?: string | null
}

export async function updateEvent(eventId: string, changes: UpdateEventInput): Promise<Event> {
    requireSession()
    const row = await apiUpdateEvent(eventId, {
        nombre: changes.nombre,
        fecha: changes.fecha,
        notas: changes.notas ?? null
    })
    return toDomainEvent(row)
}

export async function deleteEvent(eventId: string): Promise<void> {
    requireSession()
    await apiDeleteEvent(eventId)
}
