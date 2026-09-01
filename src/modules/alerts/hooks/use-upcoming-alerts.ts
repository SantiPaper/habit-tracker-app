import { useQuery } from '@tanstack/react-query'
import { addDays, differenceInCalendarDays, parseISO } from 'date-fns'

import type { AlertItem } from '../types/alert.types'

import { toDateKey } from '@/lib/date/period'
import { listEventsInRange } from '@/modules/events/services/event.service'
import { listPendingProjects } from '@/modules/projects/services/project.service'

const LOOKAHEAD_DAYS = 30

export const upcomingAlertsQueryKey = ['alerts', 'upcoming'] as const

/**
 * Junta eventos próximos (ventana de 30 días — no tiene sentido mirar más lejos, un evento no
 * "vence") y proyectos aún no marcados `hecho` (sin ventana — un proyecto vencido sigue siendo
 * relevante, por eso `listPendingProjects` no filtra por fecha). Todo ordenado cronológicamente
 * por `diasHasta` (negativo = vencido, 0 = hoy).
 */
export function useUpcomingAlerts() {
    return useQuery({
        queryKey: upcomingAlertsQueryKey,
        queryFn: async (): Promise<AlertItem[]> => {
            const today = new Date()
            const todayKey = toDateKey(today)
            const untilKey = toDateKey(addDays(today, LOOKAHEAD_DAYS))

            const [events, projects] = await Promise.all([listEventsInRange(todayKey, untilKey), listPendingProjects()])

            const eventItems: AlertItem[] = events.map(event => ({
                kind: 'event',
                fecha: event.fecha,
                diasHasta: differenceInCalendarDays(parseISO(event.fecha), today),
                event
            }))
            const projectItems: AlertItem[] = projects.map(project => ({
                kind: 'project',
                fecha: project.deadline,
                diasHasta: differenceInCalendarDays(parseISO(project.deadline), today),
                project
            }))

            return [...eventItems, ...projectItems].sort((a, b) => a.fecha.localeCompare(b.fecha))
        }
    })
}
