import type { Selectable } from 'kysely'

import type { Project } from '../types/project.types'

import type { ProjectTable } from '@/core/db/schema'

export function toDomainProject(row: Selectable<ProjectTable>): Project {
    return {
        id: row.id,
        nombre: row.nombre,
        deadline: row.deadline,
        notas: row.notas,
        estado: row.estado,
        createdAt: row.created_at,
        updatedAt: row.updated_at
    }
}
