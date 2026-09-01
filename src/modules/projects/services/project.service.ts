import { sql } from 'kysely'

import { toDomainProject } from './project.mappers'

import { db } from '@/core/db/client'
import { useSessionStore } from '@/modules/account/store/session-store'
import type { Project, ProjectEstado } from '@/modules/projects/types/project.types'

/** Mismo patrón que `habit.service.ts` — los proyectos son exclusivos de la cuenta activa en este dispositivo. */
function currentOwnerId(): string | null {
    return useSessionStore.getState().session?.userId ?? null
}

export async function listProjects(): Promise<Project[]> {
    const ownerId = currentOwnerId()
    if (!ownerId) return []

    const rows = await db
        .selectFrom('project')
        .selectAll()
        .where('owner_user_id', '=', ownerId)
        .orderBy('deadline', 'asc')
        .execute()
    return rows.map(toDomainProject)
}

export async function getProjectsDueOn(dateKey: string): Promise<Project[]> {
    const ownerId = currentOwnerId()
    if (!ownerId) return []

    const rows = await db
        .selectFrom('project')
        .selectAll()
        .where('deadline', '=', dateKey)
        .where('owner_user_id', '=', ownerId)
        .orderBy('nombre', 'asc')
        .execute()
    return rows.map(toDomainProject)
}

export async function listProjectsDueInRange(fromKey: string, toKey: string): Promise<Project[]> {
    const ownerId = currentOwnerId()
    if (!ownerId) return []

    const rows = await db
        .selectFrom('project')
        .selectAll()
        .where('deadline', '>=', fromKey)
        .where('deadline', '<=', toKey)
        .where('owner_user_id', '=', ownerId)
        .orderBy('deadline', 'asc')
        .execute()
    return rows.map(toDomainProject)
}

/** Todos los proyectos aún no marcados `hecho`, ordenados por deadline — usado por Alertas (etapa 4). */
export async function listPendingProjects(): Promise<Project[]> {
    const ownerId = currentOwnerId()
    if (!ownerId) return []

    const rows = await db
        .selectFrom('project')
        .selectAll()
        .where('estado', '=', 'pendiente')
        .where('owner_user_id', '=', ownerId)
        .orderBy('deadline', 'asc')
        .execute()
    return rows.map(toDomainProject)
}

export interface CreateProjectInput {
    nombre: string
    deadline: string
    notas?: string | null
}

export async function createProject(input: CreateProjectInput): Promise<Project> {
    const ownerId = currentOwnerId()
    if (!ownerId) throw new Error('Necesitás una cuenta para crear proyectos')

    const row = await db
        .insertInto('project')
        .values({
            id: crypto.randomUUID(),
            nombre: input.nombre,
            deadline: input.deadline,
            notas: input.notas ?? null,
            estado: 'pendiente',
            owner_user_id: ownerId
        })
        .returningAll()
        .executeTakeFirstOrThrow()
    return toDomainProject(row)
}

export interface UpdateProjectInput {
    nombre: string
    deadline: string
    notas?: string | null
}

export async function updateProject(projectId: string, changes: UpdateProjectInput): Promise<Project> {
    const ownerId = currentOwnerId()
    if (!ownerId) throw new Error('Necesitás una cuenta para editar proyectos')

    const row = await db
        .updateTable('project')
        .set({
            nombre: changes.nombre,
            deadline: changes.deadline,
            notas: changes.notas ?? null,
            updated_at: sql`datetime('now')`
        })
        .where('id', '=', projectId)
        .where('owner_user_id', '=', ownerId)
        .returningAll()
        .executeTakeFirstOrThrow()
    return toDomainProject(row)
}

export async function setProjectEstado(projectId: string, estado: ProjectEstado): Promise<Project> {
    const ownerId = currentOwnerId()
    if (!ownerId) throw new Error('Necesitás una cuenta para editar proyectos')

    const row = await db
        .updateTable('project')
        .set({ estado, updated_at: sql`datetime('now')` })
        .where('id', '=', projectId)
        .where('owner_user_id', '=', ownerId)
        .returningAll()
        .executeTakeFirstOrThrow()
    return toDomainProject(row)
}

export async function deleteProject(projectId: string): Promise<void> {
    const ownerId = currentOwnerId()
    if (!ownerId) throw new Error('Necesitás una cuenta para borrar proyectos')

    await db.deleteFrom('project').where('id', '=', projectId).where('owner_user_id', '=', ownerId).execute()
}
