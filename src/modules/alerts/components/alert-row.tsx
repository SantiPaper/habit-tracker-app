import { alertDaysLabel } from '../lib/alert-label'
import type { AlertItem } from '../types/alert.types'

import { useEventDialogStore } from '@/modules/events/store/event-dialog-store'
import { useProjectDialogStore } from '@/modules/projects/store/project-dialog-store'

interface AlertRowProps {
    item: AlertItem
}

/** Clickear una fila abre el mismo diálogo de edición que usa la Agenda (mismos stores, sin duplicar UI). */
export function AlertRow({ item }: AlertRowProps) {
    const openEditEvent = useEventDialogStore(state => state.openEdit)
    const openEditProject = useProjectDialogStore(state => state.openEdit)

    const overdue = item.diasHasta < 0
    const today = item.diasHasta === 0
    const nombre = item.kind === 'event' ? item.event.nombre : item.project.nombre
    const kindLabel = item.kind === 'event' ? 'Evento' : 'Proyecto'

    return (
        <button
            type='button'
            onClick={() => (item.kind === 'event' ? openEditEvent(item.event) : openEditProject(item.project))}
            className='border-border bg-surface hover:border-accent-2/50 flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors'
        >
            <div className='flex flex-col gap-1'>
                <div className='flex items-center gap-2'>
                    <span className='text-accent-2 font-mono text-[10px] font-bold tracking-wider uppercase'>
                        {kindLabel}
                    </span>
                    <span className='text-text text-[15px] font-medium'>{nombre}</span>
                </div>
                <span className='text-text-muted font-mono text-xs'>{item.fecha}</span>
            </div>
            <span
                className={`font-mono text-xs font-bold ${overdue ? 'text-red-400' : today ? 'text-accent' : 'text-text-muted'}`}
            >
                {alertDaysLabel(item.diasHasta)}
            </span>
        </button>
    )
}
