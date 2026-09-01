import { AlertRow } from './alert-row'

import { useUpcomingAlerts } from '@/modules/alerts/hooks/use-upcoming-alerts'

export function AlertsList() {
    const { data: items, isLoading } = useUpcomingAlerts()

    if (isLoading) return <p className='text-text-muted'>Cargando...</p>
    if (!items || items.length === 0) {
        return (
            <p className='text-text-muted'>
                No hay eventos ni proyectos próximos. Los que cargues en Agenda van a aparecer acá.
            </p>
        )
    }

    return (
        <div className='flex flex-col gap-2'>
            {items.map(item => (
                <AlertRow key={`${item.kind}-${item.kind === 'event' ? item.event.id : item.project.id}`} item={item} />
            ))}
        </div>
    )
}
