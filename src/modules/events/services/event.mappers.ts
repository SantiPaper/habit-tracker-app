import type { Selectable } from 'kysely'

import type { Event } from '../types/event.types'

import type { EventTable } from '@/core/db/schema'

export function toDomainEvent(row: Selectable<EventTable>): Event {
    return {
        id: row.id,
        nombre: row.nombre,
        fecha: row.fecha,
        notas: row.notas,
        createdAt: row.created_at,
        updatedAt: row.updated_at
    }
}
