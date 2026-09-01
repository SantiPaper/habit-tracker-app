import { sql } from 'kysely'

import { toDomainProject } from './project.mappers'

import { db } from '@/core/db/client'
import type { Project, ProjectEstado } from '@/modules/projects/types/project.types'

export async function listProjects(): Promise<Project[]> {
    const rows = await db.selectFrom('project').selectAll().orderBy('deadline', 'asc').execute()
    return rows.map(toDomainProject)
}

export async function getProjectsDueOn(dateKey: string): Promise<Project[]> {
    const rows = await db
        .selectFrom('project')
        .selectAll()
        .where('deadline', '=', dateKey)
        .orderBy('nombre', 'asc')
        .execute()
    return rows.map(toDomainProject)
}

export async function listProjectsDueInRange(fromKey: string, toKey: string): Promise<Project[]> {
    const rows = await db
        .selectFrom('project')
        .selectAll()
        .where('deadline', '>=', fromKey)
        .where('deadline', '<=', toKey)
        .orderBy('deadline', 'asc')
        .execute()
    return rows.map(toDomainProject)
}

/** Todos los proyectos aún no marcados `hecho`, ordenados por deadline — usado por Alertas (etapa 4). */
export async function listPendingProjects(): Promise<Project[]> {
    const rows = await db
        .selectFrom('project')
        .selectAll()
        .where('estado', '=', 'pendiente')
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
    const row = await db
        .insertInto('project')
        .values({
            id: crypto.randomUUID(),
            nombre: input.nombre,
            deadline: input.deadline,
            notas: input.notas ?? null,
            estado: 'pendiente'
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
    const row = await db
        .updateTable('project')
        .set({
            nombre: changes.nombre,
            deadline: changes.deadline,
            notas: changes.notas ?? null,
            updated_at: sql`datetime('now')`
        })
        .where('id', '=', projectId)
        .returningAll()
        .executeTakeFirstOrThrow()
    return toDomainProject(row)
}

export async function setProjectEstado(projectId: string, estado: ProjectEstado): Promise<Project> {
    const row = await db
        .updateTable('project')
        .set({ estado, updated_at: sql`datetime('now')` })
        .where('id', '=', projectId)
        .returningAll()
        .executeTakeFirstOrThrow()
    return toDomainProject(row)
}

export async function deleteProject(projectId: string): Promise<void> {
    await db.deleteFrom('project').where('id', '=', projectId).execute()
}
