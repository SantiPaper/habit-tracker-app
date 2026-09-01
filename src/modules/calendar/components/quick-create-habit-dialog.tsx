import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { useState } from 'react'

import { RequiresAccountNotice } from '@/modules/account/components/requires-account-notice'
import { useSessionStore } from '@/modules/account/store/session-store'
import { ColorPickerField } from '@/modules/habits/components/color-picker-field'
import { ImportanciaSelector } from '@/modules/habits/components/importancia-selector'
import { useCreateHabit } from '@/modules/habits/hooks/use-create-habit'
import { DURATION_OPTIONS, formatDuration } from '@/modules/habits/lib/schedule-options'
import type { HabitImportancia } from '@/modules/habits/types/habit.types'

const DURACION_OPTIONS = [
    { value: '', label: 'Sin especificar' },
    ...DURATION_OPTIONS.map(minutos => ({ value: String(minutos), label: formatDuration(minutos) }))
]

interface QuickCreateHabitDialogProps {
    fecha: string
    hora: string
    onClose: () => void
}

/**
 * Crear un hábito de único día desde un click en un hueco vacío de la grilla de Día — fecha/hora
 * ya vienen fijas (de dónde se clickeó), no se editan acá. Para hábitos recurrentes/otros tipos
 * sigue estando el flujo completo en la pestaña Hábitos.
 */
export function QuickCreateHabitDialog({ fecha, hora, onClose }: QuickCreateHabitDialogProps) {
    const session = useSessionStore(state => state.session)
    const [nombre, setNombre] = useState('')
    const [importancia, setImportancia] = useState<HabitImportancia>('media')
    const [color, setColor] = useState<string | null>(null)
    const [duracionMinutos, setDuracionMinutos] = useState('')
    const [error, setError] = useState<string | null>(null)
    const createHabitMutation = useCreateHabit()

    if (!session) {
        return (
            <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60' onClick={onClose}>
                <div
                    className='border-border bg-surface w-96 rounded-2xl border p-6'
                    onClick={e => e.stopPropagation()}
                >
                    <RequiresAccountNotice message='Los hábitos son exclusivos de tu cuenta — iniciá sesión desde tu Perfil para crear uno.' />
                </div>
            </div>
        )
    }

    async function handleCreate() {
        setError(null)
        if (!nombre.trim()) {
            setError('El nombre es obligatorio')
            return
        }

        await createHabitMutation.mutateAsync({
            tipo: 'diario_unico',
            nombre: nombre.trim(),
            fecha,
            hora,
            duracionMinutos: duracionMinutos ? Number(duracionMinutos) : undefined,
            color: color ?? undefined,
            importancia
        })
        onClose()
    }

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60' onClick={onClose}>
            <div
                className='border-border bg-surface flex w-96 flex-col gap-4 rounded-2xl border p-6'
                onClick={e => e.stopPropagation()}
            >
                <div className='flex flex-col gap-1'>
                    <span className='text-accent font-mono text-xs font-bold tracking-widest uppercase'>
                        Nuevo hábito
                    </span>
                    <span className='text-text-muted text-sm'>
                        {format(parseISO(fecha), "EEEE d 'de' MMMM", { locale: es })} · {hora}
                    </span>
                </div>

                <div className='flex flex-col gap-1.5'>
                    <label htmlFor='quick-nombre' className='text-text-muted text-xs font-medium'>
                        Nombre
                    </label>
                    <input
                        id='quick-nombre'
                        type='text'
                        autoFocus
                        value={nombre}
                        onChange={e => setNombre(e.target.value)}
                        placeholder='Ir al médico'
                        className='border-border bg-bg text-text placeholder:text-text-muted rounded-lg border px-3 py-2.5 text-sm'
                    />
                </div>

                <div className='flex gap-6'>
                    <div className='flex flex-col gap-1.5'>
                        <span className='text-text-muted text-xs font-medium'>Importancia</span>
                        <ImportanciaSelector value={importancia} onChange={setImportancia} />
                    </div>
                    <div className='flex flex-col gap-1.5'>
                        <span className='text-text-muted text-xs font-medium'>Color</span>
                        <ColorPickerField value={color} onChange={setColor} />
                    </div>
                </div>

                <div className='flex flex-col gap-1.5'>
                    <label htmlFor='quick-duracion' className='text-text-muted text-xs font-medium'>
                        Duración (opcional)
                    </label>
                    <select
                        id='quick-duracion'
                        value={duracionMinutos}
                        onChange={e => setDuracionMinutos(e.target.value)}
                        className='border-border bg-bg text-text rounded-lg border px-3 py-2.5 text-sm'
                    >
                        {DURACION_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>

                {error && <span className='text-sm text-red-400'>{error}</span>}

                <div className='flex justify-end gap-2'>
                    <button
                        type='button'
                        onClick={onClose}
                        className='border-border text-text-muted rounded-lg border px-4 py-2 text-sm font-medium'
                    >
                        Cancelar
                    </button>
                    <button
                        type='button'
                        onClick={handleCreate}
                        disabled={createHabitMutation.isPending}
                        className='bg-accent text-accent-ink rounded-lg px-4 py-2 text-sm font-bold transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-50'
                    >
                        {createHabitMutation.isPending ? 'Creando...' : 'Crear'}
                    </button>
                </div>
            </div>
        </div>
    )
}
