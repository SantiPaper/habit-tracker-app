import type { Event } from '../types/event.types'

import type { ApiEvent } from './event-api.service'

export function toDomainEvent(row: ApiEvent): Event {
    return {
        id: row.id,
        nombre: row.nombre,
        fecha: row.fecha,
        notas: row.notas,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt
    }
}
