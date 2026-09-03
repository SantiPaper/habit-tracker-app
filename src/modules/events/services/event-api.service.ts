import { apiRequest } from '@/modules/account/services/api-client'

export interface ApiEvent {
    id: string
    userId: string
    nombre: string
    fecha: string
    notas: string | null
    createdAt: string
    updatedAt: string
}

export interface EventBody {
    nombre: string
    fecha: string
    notas?: string | null
}

export function apiListEvents() {
    return apiRequest<ApiEvent[]>('/events')
}

export function apiCreateEvent(body: EventBody) {
    return apiRequest<ApiEvent>('/events', { method: 'POST', body })
}

export function apiUpdateEvent(eventId: string, body: EventBody) {
    return apiRequest<ApiEvent>(`/events/${eventId}`, { method: 'PATCH', body })
}

export function apiDeleteEvent(eventId: string) {
    return apiRequest<void>(`/events/${eventId}`, { method: 'DELETE' })
}
