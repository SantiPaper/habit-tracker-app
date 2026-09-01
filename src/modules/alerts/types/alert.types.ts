import type { Event } from '@/modules/events/types/event.types'
import type { Project } from '@/modules/projects/types/project.types'

export type AlertItem =
    | { kind: 'event'; fecha: string; diasHasta: number; event: Event }
    | { kind: 'project'; fecha: string; diasHasta: number; project: Project }
