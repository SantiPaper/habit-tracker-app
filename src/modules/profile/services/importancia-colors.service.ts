import { DEFAULT_IMPORTANCIA_COLORS, type ImportanciaColors } from '../types/importancia-colors.types'

import { db } from '@/core/db/client'
import type { HabitImportancia } from '@/modules/habits/types/habit.types'

/**
 * Colores por nivel de importancia — reusa la misma tabla clave-valor `setting` que el resto de
 * la configuración, pero por afuera del `settingsSchema` numérico (esto es texto, no un número).
 * Configurable desde Perfil, no desde Configuración — decisión explícita del usuario.
 */
const SETTING_KEYS: Record<HabitImportancia, string> = {
    alta: 'colorImportanciaAlta',
    media: 'colorImportanciaMedia',
    baja: 'colorImportanciaBaja'
}

export async function getImportanciaColors(): Promise<ImportanciaColors> {
    const rows = await db.selectFrom('setting').selectAll().execute()
    const byKey = new Map(rows.map(row => [row.key, row.value]))

    const result = { ...DEFAULT_IMPORTANCIA_COLORS }
    for (const nivel of Object.keys(SETTING_KEYS) as HabitImportancia[]) {
        const raw = byKey.get(SETTING_KEYS[nivel])
        if (!raw) continue
        try {
            result[nivel] = JSON.parse(raw) as string
        } catch {
            // valor corrupto — se queda el default
        }
    }
    return result
}

export async function setImportanciaColor(nivel: HabitImportancia, color: string): Promise<void> {
    await db
        .insertInto('setting')
        .values({ key: SETTING_KEYS[nivel], value: JSON.stringify(color) })
        .onConflict(oc => oc.column('key').doUpdateSet({ value: JSON.stringify(color) }))
        .execute()
}
