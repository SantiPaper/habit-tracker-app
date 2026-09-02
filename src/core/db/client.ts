import { Kysely } from 'kysely'

import type { Database } from './schema'
import { TauriSqliteDialect } from './tauri-sqlite-dialect'

// Mismo nombre que elige `src-tauri/src/lib.rs` (`cfg!(debug_assertions)` ahí, `import.meta.env.DEV`
// acá) — tienen que coincidir sí o sí, o el cliente abriría un archivo que el plugin nunca migró.
// Ver el comentario en lib.rs: sin esto, la ventana de testeo compartía el habit-tracker.db real.
const DB_FILENAME = import.meta.env.DEV ? 'habit-tracker-dev.db' : 'habit-tracker.db'

export const db = new Kysely<Database>({
    dialect: new TauriSqliteDialect({ databaseUrl: `sqlite:${DB_FILENAME}` })
})
