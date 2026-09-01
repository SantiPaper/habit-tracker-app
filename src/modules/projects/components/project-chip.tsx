import { useProjectDialogStore } from '../store/project-dialog-store'
import type { Project } from '../types/project.types'

interface ProjectChipProps {
    project: Project
    /** `full` para los paneles "sin horario" de Lista/Día; `compact` para las celdas chicas de Semana/Mes. */
    variant?: 'full' | 'compact'
}

/**
 * Chip de un Proyecto en la Agenda — mismo lenguaje visual que `EventChip` (borde `accent-2`,
 * etiqueta chica) pero con borde punteado (a diferencia del sólido de Evento) y tachado cuando
 * `estado === 'hecho'`, para distinguirlo sin inventar un color nuevo fuera de la paleta mínima
 * de la app. Clickear abre el diálogo de edición vía `useProjectDialogStore`.
 */
export function ProjectChip({ project, variant = 'full' }: ProjectChipProps) {
    const openEdit = useProjectDialogStore(state => state.openEdit)
    const done = project.estado === 'hecho'

    if (variant === 'compact') {
        return (
            <button
                type='button'
                onClick={() => openEdit(project)}
                title={project.nombre}
                className={`border-accent-2 bg-surface text-text truncate rounded border border-l-[3px] border-dashed px-1.5 py-0.5 text-left text-[10px] font-semibold ${done ? 'line-through opacity-60' : ''}`}
            >
                {project.nombre}
            </button>
        )
    }

    return (
        <button
            type='button'
            onClick={() => openEdit(project)}
            title={project.nombre}
            className={`border-accent-2 bg-surface text-text truncate rounded-lg border border-l-4 border-dashed px-3 py-2 text-left text-[13px] font-semibold ${done ? 'line-through opacity-60' : ''}`}
        >
            <span className='text-accent-2 mr-1.5 font-mono text-[10px] tracking-wider uppercase'>Proyecto</span>
            {project.nombre}
        </button>
    )
}
