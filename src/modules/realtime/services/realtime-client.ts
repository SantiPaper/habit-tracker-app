export type WsInboundMessage =
    | { type: 'friends_changed' }
    | { type: 'pending_requests_changed' }
    | { type: 'group_changed'; groupId: string }
    | { type: 'habit_data_changed' }
    | { type: 'activity_feed_changed' }
    | { type: 'auth_ok' }

const WS_URL = 'wss://habit-tracker-server-um59.onrender.com/ws'

/**
 * `WebSocket` global del WebView, sin plugin de Tauri: a diferencia de `fetch`, el handshake de
 * WebSocket no está sujeto a CORS (el navegador nunca lo bloquea por falta de headers CORS como sí
 * hace con `fetch`), así que no hace falta bypassearlo del lado de Rust.
 */
const BACKOFF_SCHEDULE_MS = [1000, 2000, 5000, 10000, 30000]

let socket: WebSocket | null = null
let reconnectTimer: ReturnType<typeof setTimeout> | null = null
let attempt = 0
let currentToken: string | null = null
let messageHandler: ((msg: WsInboundMessage) => void) | null = null
let manuallyDisconnected = false

function scheduleReconnect(): void {
    if (manuallyDisconnected || !currentToken) return
    const delay = BACKOFF_SCHEDULE_MS[Math.min(attempt, BACKOFF_SCHEDULE_MS.length - 1)]
    attempt++
    reconnectTimer = setTimeout(() => {
        if (currentToken) openSocket(currentToken)
    }, delay)
}

function openSocket(accessToken: string): void {
    try {
        socket = new WebSocket(WS_URL)
    } catch {
        scheduleReconnect()
        return
    }

    socket.onopen = () => {
        socket?.send(JSON.stringify({ type: 'auth', accessToken }))
    }

    socket.onmessage = event => {
        try {
            const msg = JSON.parse(String(event.data)) as WsInboundMessage
            if (msg.type === 'auth_ok') {
                attempt = 0
                return
            }
            messageHandler?.(msg)
        } catch {
            // mensaje no parseable — se ignora
        }
    }

    socket.onclose = () => {
        socket = null
        scheduleReconnect()
    }

    socket.onerror = () => {
        socket?.close()
    }
}

/**
 * Conecta (o reconecta) con el token dado. Llamarla de nuevo con un token distinto reconecta al
 * toque, sin pasar por el backoff — así se maneja la rotación del access token (cada ~1h, o antes
 * si hay reuse-detection) sin inventar un segundo camino de "re-auth in-band" sobre el mismo socket.
 */
export function connectRealtime(accessToken: string, onMessage: (msg: WsInboundMessage) => void): void {
    manuallyDisconnected = false
    currentToken = accessToken
    messageHandler = onMessage
    attempt = 0
    if (reconnectTimer) clearTimeout(reconnectTimer)
    socket?.close()
    openSocket(accessToken)
}

export function disconnectRealtime(): void {
    manuallyDisconnected = true
    currentToken = null
    messageHandler = null
    if (reconnectTimer) clearTimeout(reconnectTimer)
    socket?.close()
    socket = null
}
