import { SqliteAdapter, SqliteIntrospector, SqliteQueryCompiler, type Dialect, type Kysely } from 'kysely'

import { TauriSqliteDriver, type TauriSqliteDialectConfig } from './tauri-sqlite-driver'

export class TauriSqliteDialect implements Dialect {
    constructor(private readonly config: TauriSqliteDialectConfig) {}

    createDriver() {
        return new TauriSqliteDriver(this.config)
    }

    createQueryCompiler() {
        return new SqliteQueryCompiler()
    }

    createAdapter() {
        return new SqliteAdapter()
    }

    createIntrospector(db: Kysely<unknown>) {
        return new SqliteIntrospector(db)
    }
}
