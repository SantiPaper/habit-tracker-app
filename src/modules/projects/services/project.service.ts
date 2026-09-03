import { apiCreateProject, apiDeleteProject, apiListProjects, apiUpdateProject } from './project-api.service'
import { toDomainProject } from './project.mappers'

import { useSessionStore } from '@/modules/account/store/session-store'
import type { Project, ProjectEstado } from '@/modules/projects/types/project.types'

/** Etapa 2 de la migración a la nube (dominio 4) — mismo patrón que habit.service.ts. */
function requireSession(): void {
    if (!useSessionStore.getState().session) throw new Error('Necesitás una cuenta para editar proyectos')
}

export async function listProjects(): Promise<Project[]> {
    if (!useSessionStore.getState().session) return []
    const rows = await apiListProjects()
    return rows.sort((a, b) => a.deadline.localeCompare(b.deadline)).map(toDomainProject)
}

export async function getProjectsDueOn(dateKey: string): Promise<Project[]> {
    const projects = await listProjects()
    return projects.filter(p => p.deadline === dateKey).sort((a, b) => a.nombre.localeCompare(b.nombre))
}

export async function listProjectsDueInRange(fromKey: string, toKey: string): Promise<Project[]> {
    const projects = await listProjects()
    return projects.filter(p => p.deadline >= fromKey && p.deadline <= toKey)
}

/** Todos los proyectos aún no marcados `hecho` — usado por Alertas. */
export async function listPendingProjects(): Promise<Project[]> {
    const projects = await listProjects()
    return projects.filter(p => p.estado === 'pendiente')
}

export interface CreateProjectInput {
    nombre: string
    deadline: string
    notas?: string | null
}

export async function createProject(input: CreateProjectInput): Promise<Project> {
    requireSession()
    const row = await apiCreateProject({ nombre: input.nombre, deadline: input.deadline, notas: input.notas ?? null })
    return toDomainProject(row)
}

export interface UpdateProjectInput {
    nombre: string
    deadline: string
    notas?: string | null
}

export async function updateProject(projectId: string, changes: UpdateProjectInput): Promise<Project> {
    requireSession()
    const row = await apiUpdateProject(projectId, {
        nombre: changes.nombre,
        deadline: changes.deadline,
        notas: changes.notas ?? null
    })
    return toDomainProject(row)
}

export async function setProjectEstado(projectId: string, estado: ProjectEstado): Promise<Project> {
    requireSession()
    const row = await apiUpdateProject(projectId, { estado })
    return toDomainProject(row)
}

export async function deleteProject(projectId: string): Promise<void> {
    requireSession()
    await apiDeleteProject(projectId)
}
