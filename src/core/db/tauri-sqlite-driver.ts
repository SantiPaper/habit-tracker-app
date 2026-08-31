import Database from '@tauri-apps/plugin-sql'
import { CompiledQuery, type DatabaseConnection, type Driver, type QueryResult, type TransactionSettings } from 'kysely'

export interface TauriSqliteDialectConfig {
    databaseUrl: string
}

class TauriSqliteConnection implements DatabaseConnection {
    constructor(private readonly database: Database) {}

    async executeQuery<R>(compiledQuery: CompiledQuery): Promise<QueryResult<R>> {
        const { sql, parameters, query } = compiledQuery
        const params = [...parameters]

        // INSERT/UPDATE/DELETE ... RETURNING produce a row set just like a SELECT does —
        // plugin-sql's `execute()` only reports affected-row counts and silently drops those
        // rows, so anything with a `returning` clause must go through `select()` instead.
        const hasReturning = 'returning' in query && query.returning != null
        if (query.kind === 'SelectQueryNode' || hasReturning) {
            const rows = await this.database.select<R[]>(sql, params)
            return { rows }
        }

        const result = await this.database.execute(sql, params)
        return {
            rows: [],
            numAffectedRows: BigInt(result.rowsAffected),
            insertId: result.lastInsertId !== undefined ? BigInt(result.lastInsertId) : undefined
        }
    }

    // eslint-disable-next-line require-yield -- this generator always throws, it never yields
    async *streamQuery<R>(): AsyncIterableIterator<QueryResult<R>> {
        throw new Error('Streaming queries are not supported by @tauri-apps/plugin-sql')
    }
}

export class TauriSqliteDriver implements Driver {
    #database?: Database
    #connection?: TauriSqliteConnection

    constructor(private readonly config: TauriSqliteDialectConfig) {}

    async init(): Promise<void> {
        this.#database = await Database.load(this.config.databaseUrl)
        this.#connection = new TauriSqliteConnection(this.#database)
    }

    async acquireConnection(): Promise<DatabaseConnection> {
        if (!this.#connection) throw new Error('TauriSqliteDriver not initialized')
        return this.#connection
    }

    async beginTransaction(connection: DatabaseConnection, _settings: TransactionSettings): Promise<void> {
        await connection.executeQuery(CompiledQuery.raw('BEGIN'))
    }

    async commitTransaction(connection: DatabaseConnection): Promise<void> {
        await connection.executeQuery(CompiledQuery.raw('COMMIT'))
    }

    async rollbackTransaction(connection: DatabaseConnection): Promise<void> {
        await connection.executeQuery(CompiledQuery.raw('ROLLBACK'))
    }

    async releaseConnection(): Promise<void> {
        // no-op: plugin-sql manages the real connection pool in Rust; this JS Database
        // handle is a lightweight reference shared across every "connection" acquired here
    }

    async destroy(): Promise<void> {
        await this.#database?.close()
    }
}
