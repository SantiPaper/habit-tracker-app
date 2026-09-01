import { useState } from 'react'

import { useCreateEvent } from '../hooks/use-create-event'
import { useDeleteEvent } from '../hooks/use-delete-event'
import { useUpdateEvent } from '../hooks/use-update-event'
import { useEventDialogStore } from '../store/event-dialog-store'
import type { Event } from '../types/event.types'

import { DatePickerField } from '@/components/date-picker-field'

/**
 * Diálogo único para crear y editar Eventos — a diferencia de hábitos (`habit-form.tsx` +
 * `edit-habit-dialog.tsx` separados), un evento es lo bastante simple (nombre + fecha + notas)
 * como para no justificar dos componentes con el mismo chrome de modal duplicado.
 */
export function EventDialog() {
    const target = useEventDialogStore(state => state.target)
    const close = useEventDialogStore(state => state.close)

    if (!target) return null

    return <EventDialogContent target={target} onClose={close} />
}

function EventDialogContent({
    target,
    onClose
}: {
    target: { mode: 'create'; defaultDate: string } | { mode: 'edit'; event: Event }
    onClose: () => void
}) {
    const isEdit = target.mode === 'edit'
    const [nombre, setNombre] = useState(isEdit ? target.event.nombre : '')
    const [fecha, setFecha] = useState(isEdit ? target.event.fecha : target.defaultDate)
    const [notas, setNotas] = useState(isEdit ? (target.event.notas ?? '') : '')
    const [error, setError] = useState<string | null>(null)

    const createEventMutation = useCreateEvent()
    const updateEventMutation = useUpdateEvent()
    const deleteEventMutation = useDeleteEvent()

    const saving = createEventMutation.isPending || updateEventMutation.isPending
    const deleting = deleteEventMutation.isPending

    async function handleSave() {
        setError(null)
        if (!nombre.trim()) {
            setError('El nombre es obligatorio')
            return
        }
        if (!fecha) {
            setError('La fecha es obligatoria')
            return
        }

        const input = { nombre: nombre.trim(), fecha, notas: notas.trim() || null }

        if (isEdit) {
            await updateEventMutation.mutateAsync({ eventId: target.event.id, input })
        } else {
            await createEventMutation.mutateAsync(input)
        }
        onClose()
    }

    async function handleDelete() {
        if (!isEdit) return
        await deleteEventMutation.mutateAsync(target.event.id)
        onClose()
    }

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60' onClick={onClose}>
            <div
                className='border-border bg-surface flex w-[400px] flex-col rounded-2xl border'
                onClick={e => e.stopPropagation()}
            >
                <div className='flex flex-col gap-4 p-6'>
                    <span className='text-accent-2 font-mono text-xs font-bold tracking-widest uppercase'>
                        {isEdit ? 'Editar evento' : 'Nuevo evento'}
                    </span>

                    <div className='flex flex-col gap-1.5'>
                        <label htmlFor='event-nombre' className='text-text-muted text-xs font-medium'>
                            Nombre
                        </label>
                        <input
                            id='event-nombre'
                            type='text'
                            value={nombre}
                            onChange={e => setNombre(e.target.value)}
                            placeholder='Cumpleaños de Tomás'
                            className='border-border bg-bg text-text placeholder:text-text-muted rounded-lg border px-3 py-2.5 text-sm'
                        />
                    </div>

                    <div className='flex flex-col gap-1.5'>
                        <label htmlFor='event-fecha' className='text-text-muted text-xs font-medium'>
                            Fecha
                        </label>
                        <DatePickerField id='event-fecha' value={fecha} onChange={setFecha} />
                    </div>

                    <div className='flex flex-col gap-1.5'>
                        <label htmlFor='event-notas' className='text-text-muted text-xs font-medium'>
                            Notas (opcional)
                        </label>
                        <textarea
                            id='event-notas'
                            value={notas}
                            onChange={e => setNotas(e.target.value)}
                            rows={2}
                            className='border-border bg-bg text-text placeholder:text-text-muted resize-none rounded-lg border px-3 py-2.5 text-sm'
                        />
                    </div>

                    {error && <span className='text-sm text-red-400'>{error}</span>}
                </div>

                <div className='border-border flex items-center justify-between border-t p-4'>
                    {isEdit ? (
                        <button
                            type='button'
                            onClick={handleDelete}
                            disabled={deleting || saving}
                            className='text-sm font-medium text-red-400 transition-opacity hover:opacity-80 disabled:opacity-50'
                        >
                            {deleting ? 'Eliminando...' : 'Eliminar'}
                        </button>
                    ) : (
                        <span />
                    )}

                    <div className='flex gap-2'>
                        <button
                            type='button'
                            onClick={onClose}
                            className='border-border text-text-muted rounded-lg border px-4 py-2 text-sm font-medium'
                        >
                            Cancelar
                        </button>
                        <button
                            type='button'
                            onClick={handleSave}
                            disabled={saving || deleting}
                            className='bg-accent-2 text-accent-ink rounded-lg px-4 py-2 text-sm font-bold transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-50'
                        >
                            {saving ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
