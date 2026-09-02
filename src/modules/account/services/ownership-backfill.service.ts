import { db } from '@/core/db/client'

/**
 * Red de seguridad para el bug del 2026-09-01: una condición de carrera en `applyRemoteChanges`
 * (releía la sesión en cada iteración del pull) dejó hábitos con `owner_user_id: null` — intactos
 * en la base, pero invisibles porque `listHabits()` filtra por dueño exacto. Ya se corrigió la
 * causa (`local-sync-queries.ts` ahora captura el ownerId una sola vez y aborta si no hay sesión
 * estable), pero esto corre además una vez por cada hidratación de sesión válida — así, si el mismo
 * patrón de bug apareciera por otro camino no contemplado, o si algún dispositivo viejo quedó con
 * filas huérfanas de antes de este fix, se autocorrigen solas sin depender de que alguien entre a
 * mano a la base. Asume un solo dueño activo por dispositivo — asignar lo huérfano a quien está
 * logueado ahora mismo es lo correcto en ese escenario (el mismo que se hizo a mano para recuperar
 * los 3 hábitos originales de este bug).
 */
export async function backfillOrphanedOwnership(userId: string): Promise<void> {
    await Promise.all([
        db.updateTable('habit').set({ owner_user_id: userId }).where('owner_user_id', 'is', null).execute(),
        db.updateTable('event').set({ owner_user_id: userId }).where('owner_user_id', 'is', null).execute(),
        db.updateTable('project').set({ owner_user_id: userId }).where('owner_user_id', 'is', null).execute()
    ])
}
