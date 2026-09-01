import type { FriendActivityEvent } from '../types/friends.types'

const ACTIVITY_LAST_SEEN_KEY = 'friend-activity-last-seen-id'
const PENDING_REQUESTS_SEEN_KEY = 'friend-requests-seen'

/** Texto de un evento del feed de actividad — usado tanto en el toast al momento como en la lista persistente. */
export function formatActivityMessage(event: FriendActivityEvent): string {
    return event.type === 'nivel_up'
        ? `🎉 ${event.user.username} subió a nivel ${(event.payload as { nivel: number }).nivel}`
        : `🔥 ${event.user.username} anotó una nueva racha récord (${(event.payload as { rachaMaxima: number }).rachaMaxima} semanas)`
}

/**
 * Detecta eventos nuevos del feed (server-side, insert-only) desde la última vez que se miró en
 * este dispositivo — a diferencia de la detección vieja (comparar snapshots a mano por métrica),
 * el server ya decidió qué es un logro real; acá solo se filtra lo no visto. `events` viene
 * ordenado más nuevo primero (como lo entrega el server). La primera vez que corre en un
 * dispositivo guarda silencioso sin avisar nada, para no festejar de golpe todo el historial viejo.
 */
export function checkNewActivity(events: FriendActivityEvent[]): FriendActivityEvent[] {
    let lastSeenId: string | null

    try {
        lastSeenId = localStorage.getItem(ACTIVITY_LAST_SEEN_KEY)
    } catch {
        return []
    }

    const newest = events[0]?.id ?? null
    if (newest) {
        try {
            localStorage.setItem(ACTIVITY_LAST_SEEN_KEY, newest)
        } catch {
            /* no-op */
        }
    }

    if (lastSeenId === null) return []

    const seenIndex = events.findIndex(e => e.id === lastSeenId)
    // Si el último visto ya no está (se podó del lado del server, o es un dispositivo muy viejo),
    // no hay forma segura de saber cuánto es "nuevo" — mejor no avisar nada que festejar de golpe.
    if (seenIndex === -1) return []

    return events.slice(0, seenIndex).reverse()
}

/**
 * Detecta pedidos de amistad entrantes nuevos desde el último chequeo — guarda en `localStorage`
 * el set de ids ya vistos (se limpia solo cuando un pedido deja de estar pendiente, sea porque se
 * aceptó/rechazó). La primera vez que corre (nunca se guardó nada) siembra todo lo ya pendiente en
 * silencio, para no avisar de golpe pedidos que ya estaban ahí antes de esta feature.
 */
export function checkNewPendingRequests(pending: { friendshipId: string; from: { username: string } }[]): string[] {
    let stored: string | null

    try {
        stored = localStorage.getItem(PENDING_REQUESTS_SEEN_KEY)
    } catch {
        return []
    }

    const isFirstRun = stored === null
    const seen = new Set<string>(stored ? (JSON.parse(stored) as string[]) : [])
    const currentIds = new Set(pending.map(p => p.friendshipId))
    const messages: string[] = []

    for (const request of pending) {
        if (!seen.has(request.friendshipId)) {
            if (!isFirstRun) messages.push(`${request.from.username} te mandó una solicitud de amistad`)
            seen.add(request.friendshipId)
        }
    }

    for (const id of seen) {
        if (!currentIds.has(id)) seen.delete(id)
    }

    try {
        localStorage.setItem(PENDING_REQUESTS_SEEN_KEY, JSON.stringify([...seen]))
    } catch {
        /* no-op */
    }

    return messages
}
