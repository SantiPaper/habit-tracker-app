import type { Project } from '../types/project.types'

import type { ApiProject } from './project-api.service'

export function toDomainProject(row: ApiProject): Project {
    return {
        id: row.id,
        nombre: row.nombre,
        deadline: row.deadline,
        notas: row.notas,
        estado: row.estado,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt
    }
}
