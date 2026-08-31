import type { Session } from '../types/account.types'

const ADMIN_USERNAME = 'SantiPaper'

/** Único admin hardcodeado — ve la pestaña Configuración, que ajusta constantes de XP compartidas por toda la app. Caso "solo yo" hoy, no amerita un flag nuevo en el backend. */
export function isAdmin(session: Session | null): boolean {
    return session?.username === ADMIN_USERNAME
}
