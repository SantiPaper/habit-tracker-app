import { db } from '@/core/db/client'
import type { HabitLogTable, HabitTable } from '@/core/db/schema'
import { useSessionStore } from '@/modules/account/store/session-store'

const SYNC_CURSOR_KEY = 'syncCursor'
const EPOCH_SQLITE = '0000-01-01 00:00:00'

/** SQLite `datetime('now')` es UTC sin sufijo — sumarle `.000Z` alcanza para tener un ISO real. */
function sqliteToIso(sqliteDatetime: string): string {
    return `${sqliteDatetime.replace(' ', 'T')}.000Z`
}

/** Inverso — vuelve al formato nativo de las columnas locales, para no mezclar formatos de fecha en la misma columna (rompería el orden lexicográfico). */
function isoToSqlite(iso: string): string {
    return new Date(iso).toISOString().slice(0, 19).replace('T', ' ')
}

export async function getSyncCursor(): Promise<string | null> {
    const row = await db.selectFrom('setting').selectAll().where('key', '=', SYNC_CURSOR_KEY).executeTakeFirst()
    return row?.value ?? null
}

export async function setSyncCursor(iso: string): Promise<void> {
    await db
        .insertInto('setting')
        .values({ key: SYNC_CURSOR_KEY, value: iso })
        .onConflict(oc => oc.column('key').doUpdateSet({ value: iso }))
        .execute()
}

export interface PushHabit {
    id: string
    nombre: string
    tipo: string
    diasSemana: string | null
    fecha: string | null
    hora: string | null
    duracionMinutos: number | null
    color: string | null
    importancia: string
    fechaInicio: string
    fechaFin: string | null
    activo: boolean
    createdAt: string
    updatedAt: string
    scheduleBlocks: { id: string; diasSemana: string; hora: string; duracionMinutos: number | null }[]
}

export interface PushHabitLog {
    id: string
    habitId: string
    periodo: string
    estado: string
    createdAt: string
    updatedAt: string
}

export interface PushTombstone {
    id: string
    deletedAt: string
}

export interface PushClaim {
    id: string
    habitId: string
    tipo: string
    periodo: string
    xpOtorgado: number
    reclamadoEn: string
}

export interface LocalChanges {
    habits: PushHabit[]
    habitLogs: PushHabitLog[]
    tombstones: PushTombstone[]
    claims: PushClaim[]
}

export function hasLocalChanges(changes: LocalChanges): boolean {
    return (
        changes.habits.length > 0 ||
        changes.habitLogs.length > 0 ||
        changes.tombstones.length > 0 ||
        changes.claims.length > 0
    )
}

/** Todo lo local con fecha relevante posterior al cursor — lo que hay que empujar al server en esta ronda. */
export async function getLocalChangesSince(cursorIso: string | null): Promise<LocalChanges> {
    const cursor = cursorIso ? isoToSqlite(cursorIso) : EPOCH_SQLITE

    const [habitRows, allBlocks, logRows, tombstoneRows, claimRows] = await Promise.all([
        db.selectFrom('habit').selectAll().where('updated_at', '>', cursor).execute(),
        db.selectFrom('habit_schedule_block').selectAll().execute(),
        db.selectFrom('habit_log').selectAll().where('updated_at', '>', cursor).execute(),
        db.selectFrom('habit_log_tombstone').selectAll().where('deleted_at', '>', cursor).execute(),
        db.selectFrom('habit_period_claim').selectAll().where('reclamado_en', '>', cursor).execute()
    ])

    const blocksByHabitId = new Map<string, typeof allBlocks>()
    for (const block of allBlocks) {
        const list = blocksByHabitId.get(block.habit_id)
        if (list) list.push(block)
        else blocksByHabitId.set(block.habit_id, [block])
    }

    return {
        habits: habitRows.map(h => ({
            id: h.id,
            nombre: h.nombre,
            tipo: h.tipo,
            diasSemana: h.dias_semana,
            fecha: h.fecha,
            hora: h.hora,
            duracionMinutos: h.duracion_minutos,
            color: h.color,
            importancia: h.importancia,
            fechaInicio: h.fecha_inicio,
            fechaFin: h.fecha_fin,
            activo: h.activo === 1,
            createdAt: sqliteToIso(h.created_at),
            updatedAt: sqliteToIso(h.updated_at),
            scheduleBlocks: (blocksByHabitId.get(h.id) ?? []).map(b => ({
                id: b.id,
                diasSemana: b.dias_semana,
                hora: b.hora,
                duracionMinutos: b.duracion_minutos
            }))
        })),
        habitLogs: logRows.map(l => ({
            id: l.id,
            habitId: l.habit_id,
            periodo: l.periodo,
            estado: l.estado,
            createdAt: sqliteToIso(l.created_at),
            updatedAt: sqliteToIso(l.updated_at)
        })),
        tombstones: tombstoneRows.map(t => ({ id: t.id, deletedAt: sqliteToIso(t.deleted_at) })),
        claims: claimRows.map(c => ({
            id: c.id,
            habitId: c.habit_id,
            tipo: c.tipo,
            periodo: c.periodo,
            xpOtorgado: c.xp_otorgado,
            reclamadoEn: sqliteToIso(c.reclamado_en)
        }))
    }
}

export interface RemoteChanges {
    habits: {
        id: string
        nombre: string
        tipo: string
        diasSemana: string | null
        fecha: string | null
        hora: string | null
        duracionMinutos: number | null
        color: string | null
        importancia: string
        fechaInicio: string
        fechaFin: string | null
        activo: boolean
        createdAt: string
        updatedAt: string
        scheduleBlocks: { id: string; diasSemana: string; hora: string; duracionMinutos: number | null }[]
    }[]
    habitLogs: { id: string; habitId: string; periodo: string; estado: string; createdAt: string; updatedAt: string }[]
    tombstones: { id: string; deletedAt: string }[]
    claims: { id: string; habitId: string; tipo: string; periodo: string; xpOtorgado: number; reclamadoEn: string }[]
}

/** Aplica lo que trajo el pull — last-write-wins comparando contra lo que ya hay local antes de pisar. */
export async function applyRemoteChanges(remote: RemoteChanges): Promise<void> {
    for (const habit of remote.habits) {
        const existing = await db.selectFrom('habit').select('updated_at').where('id', '=', habit.id).executeTakeFirst()
        const incoming = isoToSqlite(habit.updatedAt)
        if (existing && existing.updated_at >= incoming) continue

        await db.transaction().execute(async trx => {
            // `created_at` es insert-only en el tipo de Kysely (nunca se pisa en un UPDATE) — se
            // arma un objeto separado para cada rama en vez de uno solo con todos los campos.
            const mutableFields = {
                nombre: habit.nombre,
                tipo: habit.tipo as HabitTable['tipo'],
                dias_semana: habit.diasSemana,
                fecha: habit.fecha,
                hora: habit.hora,
                duracion_minutos: habit.duracionMinutos,
                color: habit.color,
                importancia: habit.importancia as HabitTable['importancia'],
                fecha_inicio: habit.fechaInicio,
                fecha_fin: habit.fechaFin,
                activo: habit.activo ? 1 : 0,
                updated_at: incoming
            }

            if (existing) {
                await trx.updateTable('habit').set(mutableFields).where('id', '=', habit.id).execute()
            } else {
                // Un hábito que llega por sync siempre es de la cuenta que está haciendo el pull —
                // sin esto quedaría sin dueño e invisible incluso para esa misma cuenta.
                await trx
                    .insertInto('habit')
                    .values({
                        id: habit.id,
                        ...mutableFields,
                        created_at: isoToSqlite(habit.createdAt),
                        owner_user_id: useSessionStore.getState().session?.userId ?? null
                    })
                    .execute()
            }

            await trx.deleteFrom('habit_schedule_block').where('habit_id', '=', habit.id).execute()
            if (habit.scheduleBlocks.length > 0) {
                await trx
                    .insertInto('habit_schedule_block')
                    .values(
                        habit.scheduleBlocks.map(b => ({
                            id: b.id,
                            habit_id: habit.id,
                            dias_semana: b.diasSemana,
                            hora: b.hora,
                            duracion_minutos: b.duracionMinutos
                        }))
                    )
                    .execute()
            }
        })
    }

    for (const log of remote.habitLogs) {
        const existing = await db
            .selectFrom('habit_log')
            .select('updated_at')
            .where('id', '=', log.id)
            .executeTakeFirst()
        const incoming = isoToSqlite(log.updatedAt)
        if (existing && existing.updated_at >= incoming) continue

        const mutableFields = {
            habit_id: log.habitId,
            periodo: log.periodo,
            estado: log.estado as HabitLogTable['estado'],
            updated_at: incoming
        }
        const values = { id: log.id, ...mutableFields, created_at: isoToSqlite(log.createdAt) }

        if (existing) {
            await db.updateTable('habit_log').set(mutableFields).where('id', '=', log.id).execute()
        } else {
            // Puede chocar con el UNIQUE(habit_id, periodo) si el otro dispositivo insertó otra fila
            // para el mismo período — en ese caso gana igual la más nueva vía el mismo criterio.
            await db
                .insertInto('habit_log')
                .values(values)
                .onConflict(oc => oc.columns(['habit_id', 'periodo']).doUpdateSet(mutableFields))
                .execute()
        }
    }

    // Tumba remota = alguien borró esa fila en otro dispositivo — se borra acá también, sin
    // generar una tumba local nueva (ya existe del lado del server, re-pushearla sería inútil).
    for (const tombstone of remote.tombstones) {
        await db.deleteFrom('habit_log').where('id', '=', tombstone.id).execute()
    }

    for (const claim of remote.claims) {
        const existing = await db
            .selectFrom('habit_period_claim')
            .select('id')
            .where('id', '=', claim.id)
            .executeTakeFirst()
        if (existing) continue

        await db
            .insertInto('habit_period_claim')
            .values({
                id: claim.id,
                habit_id: claim.habitId,
                tipo: claim.tipo as 'semanal' | 'mensual',
                periodo: claim.periodo,
                xp_otorgado: claim.xpOtorgado,
                reclamado_en: isoToSqlite(claim.reclamadoEn)
            })
            .execute()
    }
}
