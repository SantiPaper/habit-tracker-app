import { useEventDialogStore } from '../store/event-dialog-store'
import type { Event } from '../types/event.types'

interface EventChipProps {
    event: Event
    /** `full` para los paneles "sin horario" de Lista/Día; `compact` para las celdas chicas de Semana/Mes. */
    variant?: 'full' | 'compact'
}

/**
 * Chip de un Evento en la Agenda — visualmente distinto de `HabitBlock`/`UnscheduledChip` (borde
 * en `accent-2` + etiqueta "EVENTO", sin color propio del hábito ni estado tri-estado) porque un
 * evento no se marca cumplido/no cumplido, solo existe en su fecha. Clickear abre el diálogo de
 * edición vía `useEventDialogStore` — sin prop drilling por las 4 sub-vistas de Agenda.
 */
export function EventChip({ event, variant = 'full' }: EventChipProps) {
    const openEdit = useEventDialogStore(state => state.openEdit)

    if (variant === 'compact') {
        return (
            <button
                type='button'
                onClick={() => openEdit(event)}
                title={event.nombre}
                className='border-accent-2 bg-surface text-text truncate rounded border border-l-[3px] px-1.5 py-0.5 text-left text-[10px] font-semibold'
            >
                {event.nombre}
            </button>
        )
    }

    return (
        <button
            type='button'
            onClick={() => openEdit(event)}
            title={event.nombre}
            className='border-accent-2 bg-surface text-text truncate rounded-lg border border-l-4 px-3 py-2 text-left text-[13px] font-semibold'
        >
            <span className='text-accent-2 mr-1.5 font-mono text-[10px] tracking-wider uppercase'>Evento</span>
            {event.nombre}
        </button>
    )
}
