import { apiRequest } from '@/modules/account/services/api-client'
import type { ProjectEstado } from '@/modules/projects/types/project.types'

export interface ApiProject {
    id: string
    userId: string
    nombre: string
    deadline: string
    notas: string | null
    estado: ProjectEstado
    createdAt: string
    updatedAt: string
}

export interface CreateProjectBody {
    nombre: string
    deadline: string
    notas?: string | null
}

export interface UpdateProjectBody {
    nombre?: string
    deadline?: string
    notas?: string | null
    estado?: ProjectEstado
}

export function apiListProjects() {
    return apiRequest<ApiProject[]>('/projects')
}

export function apiCreateProject(body: CreateProjectBody) {
    return apiRequest<ApiProject>('/projects', { method: 'POST', body })
}

export function apiUpdateProject(projectId: string, body: UpdateProjectBody) {
    return apiRequest<ApiProject>(`/projects/${projectId}`, { method: 'PATCH', body })
}

export function apiDeleteProject(projectId: string) {
    return apiRequest<void>(`/projects/${projectId}`, { method: 'DELETE' })
}
