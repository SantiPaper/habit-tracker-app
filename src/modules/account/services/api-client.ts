import { fetch as tauriFetch } from '@tauri-apps/plugin-http'

import { clearSession, setSession } from './session.service'

import { useSessionStore } from '@/modules/account/store/session-store'
import type { Session } from '@/modules/account/types/account.types'

/**
 * A propósito NO es un setting editable por el usuario: todos los amigos necesitan apuntar al
 * mismo servidor para poder verse entre sí, así que es una decisión de build, no de cada
 * instalación. Actualizar acá cuando se defina el hosting real.
 */
export const API_BASE_URL = 'https://habit-tracker-server-um59.onrender.com/api'

export class ApiError extends Error {
    constructor(
        message: string,
        public readonly status: number
    ) {
        super(message)
        this.name = 'ApiError'
    }
}

interface RequestOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
    body?: unknown
    query?: Record<string, string>
}

async function refreshSession(current: Session): Promise<Session | null> {
    const res = await tauriFetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: current.refreshToken })
    })
    if (!res.ok) return null

    const data = (await res.json()) as { accessToken: string }
    const next: Session = { ...current, accessToken: data.accessToken }
    useSessionStore.getState().setSession(next)
    await setSession(next)
    return next
}

/**
 * Cliente HTTP central hacia `habit-tracker-server` — usa el `fetch` de `@tauri-apps/plugin-http`
 * (corre del lado de Rust), no el `fetch` global del navegador: un WebView de Tauri le aplica CORS
 * del lado del browser al `fetch` normal, el plugin lo evita de raíz. Agrega el access token
 * automáticamente cuando hay sesión, y si el server responde 401 intenta refrescar una vez antes
 * de rendirse (y ahí sí cierra la sesión local).
 */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const url = new URL(`${API_BASE_URL}${path}`)
    if (options.query) {
        for (const [key, value] of Object.entries(options.query)) url.searchParams.set(key, value)
    }

    const send = (accessToken: string | undefined) =>
        tauriFetch(url.toString(), {
            method: options.method ?? 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
            },
            body: options.body !== undefined ? JSON.stringify(options.body) : undefined
        })

    const session = useSessionStore.getState().session
    let res = await send(session?.accessToken)

    if (res.status === 401 && session) {
        const refreshed = await refreshSession(session)
        if (refreshed) {
            res = await send(refreshed.accessToken)
        } else {
            useSessionStore.getState().setSession(null)
            await clearSession()
        }
    }

    if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { message?: string }
        throw new ApiError(body.message ?? 'Error de red', res.status)
    }

    if (res.status === 204) return undefined as T
    return (await res.json()) as T
}
