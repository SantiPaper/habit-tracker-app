import { Kysely } from 'kysely'

import type { Database } from './schema'
import { TauriSqliteDialect } from './tauri-sqlite-dialect'

export const db = new Kysely<Database>({
    dialect: new TauriSqliteDialect({ databaseUrl: 'sqlite:habit-tracker.db' })
})
