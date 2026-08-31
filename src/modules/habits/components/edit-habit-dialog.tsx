import { useState } from 'react'

import { diasSemanaChanged, useUpdateHabit } from '../hooks/use-update-habit'
import { DURATION_OPTIONS, TIME_OPTIONS, formatDuration } from '../lib/schedule-options'
import type { Habit, HabitTipo } from '../types/habit.types'

import { ColorPickerField } from './color-picker-field'
import { ImportanciaSelector } from './importancia-selector'
import type { EditableScheduleBlock } from './schedule-blocks-editor'
import { ScheduleBlocksEditor } from './schedule-blocks-editor'
import { WeekdayPicker } from './weekday-picker'

import { ComboboxField } from '@/components/combobox-field'
import { DatePickerField } from '@/components/date-picker-field'

const TIPO_LABELS: Record<HabitTipo, string> = {
    diario_recurrente: 'Diario recurrente',
    diario_unico: 'Único',
    semanal: 'Semanal',
    mensual: 'Mensual'
}

interface EditHabitDialogProps {
    habit: Habit
    onClose: () => void
}

export function EditHabitDialog({ habit, onClose }: EditHabitDialogProps) {
    const [nombre, setNombre] = useState(habit.nombre)
    const [diasSemana, setDiasSemana] = useState<number[]>(habit.diasSemana ?? [])
    const [scheduleBlocks, setScheduleBlocks] = useState<EditableScheduleBlock[]>(
        habit.scheduleBlocks.map(({ diasSemana: dias, hora: h, duracionMinutos: d }) => ({
            diasSemana: dias,
            hora: h,
            duracionMinutos: d
        }))
    )
    const [fecha, setFecha] = useState(habit.fecha ?? '')
    const [hora, setHora] = useState(habit.hora ?? '')
    const [duracionMinutos, setDuracionMinutos] = useState(habit.duracionMinutos ? String(habit.duracionMinutos) : '')
    const [color, setColor] = useState(habit.color)
    const [importancia, setImportancia] = useState(habit.importancia)
    const [error, setError] = useState<string | null>(null)
    const updateHabitMutation = useUpdateHabit()

    // Si el hábito ya tenía una hora/duración que no cae en la grilla de 15 min (dato viejo,
    // de antes de este cambio), la agregamos igual como opción para no perderla silenciosamente.
    const horaOptions = hora && !TIME_OPTIONS.includes(hora) ? [...TIME_OPTIONS, hora].sort() : TIME_OPTIONS
    const horaSelectOptions = [
        { value: '', label: 'Sin especificar' },
        ...horaOptions.map(time => ({ value: time, label: time }))
    ]
    const duracionValue = duracionMinutos ? Number(duracionMinutos) : null
    const duracionOptions =
        duracionValue && !DURATION_OPTIONS.includes(duracionValue)
            ? [...DURATION_OPTIONS, duracionValue].sort((a, b) => a - b)
            : DURATION_OPTIONS
    const duracionSelectOptions = [
        { value: '', label: 'Sin especificar' },
        ...duracionOptions.map(minutos => ({ value: String(minutos), label: formatDuration(minutos) }))
    ]

    function changeDiasSemana(value: number[]) {
        setDiasSemana(value)
        setScheduleBlocks(current =>
            current
                .map(block => ({ ...block, diasSemana: block.diasSemana.filter(d => value.includes(d)) }))
                .filter(block => block.diasSemana.length > 0)
        )
    }

    async function handleSave() {
        setError(null)

        if (!nombre.trim()) {
            setError('El nombre es obligatorio')
            return
        }
        if (habit.tipo === 'diario_recurrente' && diasSemana.length === 0) {
            setError('Elegí al menos un día')
            return
        }
        if (habit.tipo === 'diario_unico' && !fecha) {
            setError('La fecha es obligatoria')
            return
        }

        await updateHabitMutation.mutateAsync({
            habit,
            input: {
                nombre: nombre.trim(),
                diasSemana: habit.tipo === 'diario_recurrente' ? diasSemana : undefined,
                scheduleBlocks: habit.tipo === 'diario_recurrente' ? scheduleBlocks : undefined,
                fecha: habit.tipo === 'diario_unico' ? fecha : undefined,
                hora: habit.tipo === 'diario_recurrente' ? undefined : hora || undefined,
                duracionMinutos:
                    habit.tipo === 'diario_recurrente'
                        ? undefined
                        : duracionMinutos
                          ? Number(duracionMinutos)
                          : undefined,
                color: color ?? undefined,
                importancia
            }
        })
        onClose()
    }

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60' onClick={onClose}>
            <div
                className='border-border bg-surface flex max-h-[85vh] w-[440px] flex-col rounded-2xl border'
                onClick={e => e.stopPropagation()}
            >
                <div className='flex flex-col gap-4 overflow-y-auto p-6'>
                    <div className='flex flex-col gap-1'>
                        <span className='text-accent font-mono text-xs font-bold tracking-widest uppercase'>
                            Editar · {TIPO_LABELS[habit.tipo]}
                        </span>
                        <span className='text-text text-base font-semibold'>{habit.nombre}</span>
                    </div>

                    <div className='flex flex-col gap-1.5'>
                        <label htmlFor='edit-nombre' className='text-text-muted text-xs font-medium'>
                            Nombre
                        </label>
                        <input
                            id='edit-nombre'
                            type='text'
                            value={nombre}
                            onChange={e => setNombre(e.target.value)}
                            className='border-border bg-bg text-text rounded-lg border px-3 py-2.5 text-sm'
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

                    {habit.tipo === 'diario_recurrente' && (
                        <div className='flex flex-col gap-1.5'>
                            <span className='text-text-muted text-xs font-medium'>Días</span>
                            <WeekdayPicker value={diasSemana} onChange={changeDiasSemana} size='sm' />
                        </div>
                    )}

                    {habit.tipo === 'diario_unico' && (
                        <div className='flex flex-col gap-1.5'>
                            <label htmlFor='edit-fecha' className='text-text-muted text-xs font-medium'>
                                Fecha
                            </label>
                            <DatePickerField id='edit-fecha' value={fecha} onChange={setFecha} />
                        </div>
                    )}

                    {habit.tipo === 'diario_recurrente' ? (
                        <div className='flex flex-col gap-1.5'>
                            <span className='text-text-muted text-xs font-medium'>Bloques de horario (opcional)</span>
                            <ScheduleBlocksEditor
                                diasSemana={diasSemana}
                                blocks={scheduleBlocks}
                                onChange={setScheduleBlocks}
                            />
                        </div>
                    ) : (
                        <div className='flex gap-3'>
                            <div className='flex flex-1 flex-col gap-1.5'>
                                <label htmlFor='edit-hora' className='text-text-muted text-xs font-medium'>
                                    Hora (opcional)
                                </label>
                                <ComboboxField
                                    id='edit-hora'
                                    value={hora}
                                    onChange={setHora}
                                    options={horaSelectOptions}
                                />
                            </div>
                            <div className='flex flex-1 flex-col gap-1.5'>
                                <label htmlFor='edit-duracion' className='text-text-muted text-xs font-medium'>
                                    Duración
                                </label>
                                <ComboboxField
                                    id='edit-duracion'
                                    value={duracionMinutos}
                                    onChange={setDuracionMinutos}
                                    options={duracionSelectOptions}
                                />
                            </div>
                        </div>
                    )}

                    {error && <span className='text-sm text-red-400'>{error}</span>}

                    {habit.tipo === 'diario_recurrente' && diasSemanaChanged(habit.diasSemana, diasSemana) && (
                        <span className='text-text-muted text-xs'>
                            Cambiar los días cierra este hábito hoy y crea uno nuevo con el horario nuevo — tu historial
                            se conserva intacto.
                        </span>
                    )}
                </div>

                <div className='border-border flex justify-end gap-2 border-t p-4'>
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
                        disabled={updateHabitMutation.isPending}
                        className='bg-accent text-accent-ink rounded-lg px-4 py-2 text-sm font-bold disabled:opacity-50'
                    >
                        {updateHabitMutation.isPending ? 'Guardando...' : 'Guardar'}
                    </button>
                </div>
            </div>
        </div>
    )
}
