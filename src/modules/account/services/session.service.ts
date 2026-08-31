import type { Session } from '../types/account.types'

import { db } from '@/core/db/client'

/**
 * Sesión de cuenta (tokens + user) — mismo patrón que `profile/services/importancia-colors.service.ts`:
 * reusa la tabla `setting` clave-valor genérica, por afuera del `settingsSchema` numérico. Una
 * sola clave con el objeto entero serializado, sin migración nueva.
 */
const SESSION_KEY = 'accountSession'

export async function getSession(): Promise<Session | null> {
    const row = await db.selectFrom('setting').selectAll().where('key', '=', SESSION_KEY).executeTakeFirst()
    if (!row) return null

    try {
        return JSON.parse(row.value) as Session
    } catch {
        return null
    }
}

export async function setSession(session: Session): Promise<void> {
    await db
        .insertInto('setting')
        .values({ key: SESSION_KEY, value: JSON.stringify(session) })
        .onConflict(oc => oc.column('key').doUpdateSet({ value: JSON.stringify(session) }))
        .execute()
}

export async function clearSession(): Promise<void> {
    await db.deleteFrom('setting').where('key', '=', SESSION_KEY).execute()
}
