const NIVEL_SEEN_PREFIX = 'friend-nivel-seen:'
const RACHA_OVERTAKE_PREFIX = 'friend-racha-overtook:'
const PENDING_REQUESTS_SEEN_KEY = 'friend-requests-seen'

/**
 * Detecta si un amigo subió de nivel desde la última vez que se vio — mismo patrón que
 * `use-league-up-flourish.ts` (localStorage por id, dato de deduplicación, no crítico si se
 * pierde). La primera vez que se ve un amigo guarda silencioso sin avisar, para no festejar de
 * golpe todo el progreso que ya tenía antes de agregarlo.
 */
export function checkNivelUp(friendId: string, username: string, currentNivel: number): string | null {
    const key = NIVEL_SEEN_PREFIX + friendId
    let lastSeen: string | null

    try {
        lastSeen = localStorage.getItem(key)
    } catch {
        return null
    }

    if (lastSeen === null) {
        try {
            localStorage.setItem(key, String(currentNivel))
        } catch {
            /* localStorage no disponible — no rompe la UI */
        }
        return null
    }

    const lastNivel = Number(lastSeen)
    if (currentNivel !== lastNivel) {
        try {
            localStorage.setItem(key, String(currentNivel))
        } catch {
            /* no-op */
        }
    }

    return currentNivel > lastNivel ? `🎉 ${username} subió a nivel ${currentNivel}` : null
}

/**
 * Detecta si un amigo acaba de superarte en racha máxima — guarda si en el último chequeo ya te
 * había superado, para avisar una sola vez al cruzar (no en cada poll mientras siga por delante),
 * y resetea solo si volvés a estar adelante, para que pueda volver a avisar si te supera de nuevo.
 */
export function checkRachaOvertake(
    friendId: string,
    username: string,
    myRachaMaxima: number,
    friendRachaMaxima: number
): string | null {
    const key = RACHA_OVERTAKE_PREFIX + friendId
    let stored: string | null

    try {
        stored = localStorage.getItem(key)
    } catch {
        return null
    }

    const overtakesNow = friendRachaMaxima > myRachaMaxima
    const nextValue = overtakesNow ? '1' : '0'

    if (stored === null) {
        try {
            localStorage.setItem(key, nextValue)
        } catch {
            /* no-op */
        }
        return null
    }

    if (stored !== nextValue) {
        try {
            localStorage.setItem(key, nextValue)
        } catch {
            /* no-op */
        }
    }

    return overtakesNow && stored === '0'
        ? `${username} te superó en racha (${friendRachaMaxima} vs ${myRachaMaxima} semanas)`
        : null
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
