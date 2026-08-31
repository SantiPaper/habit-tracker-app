import { settingsSchema, type Settings, type SettingKey } from '../types/settings.types'

import { db } from '@/core/db/client'

export async function getSettings(): Promise<Settings> {
    const rows = await db.selectFrom('setting').selectAll().execute()
    const raw: Record<string, unknown> = {}

    for (const row of rows) {
        try {
            raw[row.key] = JSON.parse(row.value)
        } catch {
            // ignore malformed values, the schema default takes over
        }
    }

    return settingsSchema.parse(raw)
}

export async function setSetting(key: SettingKey, value: number): Promise<void> {
    await db
        .insertInto('setting')
        .values({ key, value: JSON.stringify(value) })
        .onConflict(oc => oc.column('key').doUpdateSet({ value: JSON.stringify(value) }))
        .execute()
}
