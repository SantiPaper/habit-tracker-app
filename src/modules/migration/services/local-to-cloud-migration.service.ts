import { db } from '@/core/db/client'
import { useSessionStore } from '@/modules/account/store/session-store'
import { apiConsumeStreakFreeze, apiEarnStreakFreeze } from '@/modules/achievements/services/streak-freeze-api.service'
import { apiCreateEvent } from '@/modules/events/services/event-api.service'
import { apiCreateClaim } from '@/modules/gamification/services/claim-api.service'
import { apiCreateHabit, apiListHabits, apiUpdateHabit } from '@/modules/habits/services/habit-api.service'
import { apiUpsertLog } from '@/modules/habits/services/habit-log-api.service'
import { apiUpsertException } from '@/modules/habits/services/habit-schedule-exception-api.service'
import { apiCreateProject, apiUpdateProject } from '@/modules/projects/services/project-api.service'

const MIGRATION_DONE_KEY = 'cloudMigrationDone'

async function isMigrationDone(): Promise<boolean> {
    const row = await db.selectFrom('setting').selectAll().where('key', '=', MIGRATION_DONE_KEY).executeTakeFirst()
    return row?.value === '1'
}

async function markMigrationDone(): Promise<void> {
    await db
        .insertInto('setting')
        .values({ key: MIGRATION_DONE_KEY, value: '1' })
        .onConflict(oc => oc.column('key').doUpdateSet({ value: '1' }))
        .execute()
}

/** No relanza — loguea y sigue. La API no soporta "crear con este id si no existe todavía"
 * (a diferencia del sync viejo, acá el server siempre asigna un id nuevo), así que si un ítem
 * falla a mitad de la migración y se reintentara desde cero, un hábito ya creado se duplicaría.
 * Mejor "mejor esfuerzo, se pierde ese ítem puntual" que "duplica todo lo que ya había subido bien". */
async function safely(label: string, fn: () => Promise<unknown>): Promise<void> {
    try {
        await fn()
    } catch (error) {
        console.error(`[migration] falló migrando ${label}`, error)
    }
}

/**
 * Corre UNA vez por dispositivo, la primera vez que se abre la app después de la actualización que
 * saca los datos de SQLite local — empuja lo que ya había local (hábitos, eventos, proyectos, logs,
 * excepciones, claims, streak freezes) a la cuenta de la nube antes de que el resto de la app deje
 * de leer la base local para siempre. Sin esto, cualquier persona con hábitos reales cargados
 * (no solo una cuenta puntual que se pueda migrar a mano) vería la app vacía al actualizarse — no
 * hay forma de correr un script en la máquina de otra persona, tiene que migrarse sola.
 *
 * Se acuerda que ya corrió con una fila en `setting` (por dispositivo, no por cuenta). Si la cuenta
 * YA tiene hábitos en la nube (de una migración anterior en otro dispositivo, o de haberlos creado
 * ya ahí) no empuja nada — se asume que ya está migrada, para no duplicar.
 *
 * SIEMPRE se marca "hecho" al final, haya fallado algún ítem puntual o no — un reintento
 * duplicaría los hábitos que sí se subieron bien la primera vez (la API no tiene upsert-por-id acá).
 */
export async function migrateLocalDataToCloud(): Promise<void> {
    if (await isMigrationDone()) return

    // Sin esto, un dispositivo que en algún momento tuvo más de una cuenta local (pasó de verdad
    // esta sesión, con el bug de owner_user_id nulo) podría migrarle a la cuenta actual hábitos que
    // en realidad eran de otra cuenta distinta que se usó antes en el mismo dispositivo.
    const ownerId = useSessionStore.getState().session?.userId
    if (!ownerId) return

    try {
        const existingCloudHabits = await apiListHabits()
        if (existingCloudHabits.length > 0) {
            await markMigrationDone()
            return
        }

        const localHabits = await db.selectFrom('habit').selectAll().where('owner_user_id', '=', ownerId).execute()
        const idMap = new Map<string, string>()

        for (const habit of localHabits) {
            await safely(`hábito "${habit.nombre}"`, async () => {
                const blocks = await db
                    .selectFrom('habit_schedule_block')
                    .selectAll()
                    .where('habit_id', '=', habit.id)
                    .execute()

                const created = await apiCreateHabit({
                    nombre: habit.nombre,
                    tipo: habit.tipo,
                    diasSemana: habit.dias_semana,
                    fecha: habit.fecha,
                    hora: habit.hora,
                    duracionMinutos: habit.duracion_minutos,
                    color: habit.color,
                    importancia: habit.importancia,
                    fechaInicio: habit.fecha_inicio,
                    scheduleBlocks: blocks.map(b => ({
                        diasSemana: b.dias_semana,
                        hora: b.hora,
                        duracionMinutos: b.duracion_minutos
                    }))
                })
                idMap.set(habit.id, created.id)

                // createHabit siempre arranca activo:true/fechaFin:null — un hábito retirado
                // localmente necesita un segundo paso para llegar igual a la nube.
                if (habit.activo === 0 || habit.fecha_fin) {
                    await apiUpdateHabit(created.id, { activo: habit.activo === 1, fechaFin: habit.fecha_fin })
                }
            })
        }

        const localLogs = await db.selectFrom('habit_log').selectAll().execute()
        for (const log of localLogs) {
            const cloudHabitId = idMap.get(log.habit_id)
            if (!cloudHabitId) continue
            await safely(`log ${log.periodo}`, () => apiUpsertLog(cloudHabitId, log.periodo, log.estado))
        }

        const localClaims = await db.selectFrom('habit_period_claim').selectAll().execute()
        for (const claim of localClaims) {
            const cloudHabitId = idMap.get(claim.habit_id)
            if (!cloudHabitId) continue
            await safely(`claim ${claim.periodo}`, () =>
                apiCreateClaim(cloudHabitId, claim.tipo, claim.periodo, claim.xp_otorgado)
            )
        }

        const localExceptions = await db.selectFrom('habit_schedule_exception').selectAll().execute()
        for (const exception of localExceptions) {
            const cloudHabitId = idMap.get(exception.habit_id)
            if (!cloudHabitId) continue
            await safely(`excepción ${exception.fecha}`, () =>
                apiUpsertException(cloudHabitId, exception.fecha, exception.hora, exception.duracion_minutos)
            )
        }

        const localFreezes = await db.selectFrom('habit_streak_freeze').selectAll().execute()
        for (const freeze of localFreezes) {
            const cloudHabitId = idMap.get(freeze.habit_id)
            if (!cloudHabitId) continue
            await safely(`streak freeze milestone ${freeze.milestone_racha}`, async () => {
                const cloudFreeze = await apiEarnStreakFreeze(cloudHabitId, freeze.milestone_racha)
                if (freeze.consumed_periodo) {
                    await apiConsumeStreakFreeze(cloudHabitId, cloudFreeze.id, freeze.consumed_periodo)
                }
            })
        }

        const localEvents = await db.selectFrom('event').selectAll().where('owner_user_id', '=', ownerId).execute()
        for (const event of localEvents) {
            await safely(`evento "${event.nombre}"`, () =>
                apiCreateEvent({ nombre: event.nombre, fecha: event.fecha, notas: event.notas })
            )
        }

        const localProjects = await db.selectFrom('project').selectAll().where('owner_user_id', '=', ownerId).execute()
        for (const project of localProjects) {
            await safely(`proyecto "${project.nombre}"`, async () => {
                const created = await apiCreateProject({
                    nombre: project.nombre,
                    deadline: project.deadline,
                    notas: project.notas
                })
                if (project.estado === 'hecho') {
                    await apiUpdateProject(created.id, { estado: 'hecho' })
                }
            })
        }
    } catch (error) {
        // Algo cortó ANTES de siquiera poder intentar hábito por hábito (ej. sin conexión al
        // arrancar) — ahí sí vale la pena reintentar en el próximo arranque, no se marca "hecho".
        console.error('[migration] no se pudo ni arrancar la migración local→nube', error)
        return
    }

    await markMigrationDone()
}
