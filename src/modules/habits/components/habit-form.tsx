import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { useCreateHabit } from '../hooks/use-create-habit'
import { usePastUnicoHabits } from '../hooks/use-past-unico-habits'
import { DURATION_OPTIONS, TIME_OPTIONS, formatDuration } from '../lib/schedule-options'
import { createHabitSchema } from '../schemas/habit.schema'
import type { HabitImportancia, HabitTipo } from '../types/habit.types'

import { ColorPickerField } from './color-picker-field'
import { ImportanciaSelector } from './importancia-selector'
import type { EditableScheduleBlock } from './schedule-blocks-editor'
import { ScheduleBlocksEditor } from './schedule-blocks-editor'
import { WeekdayPicker } from './weekday-picker'

import { ComboboxField } from '@/components/combobox-field'
import { DatePickerField } from '@/components/date-picker-field'
import { SelectField } from '@/components/select-field'
import { useSessionStore } from '@/modules/account/store/session-store'

const TIPO_LABELS: Record<HabitTipo, string> = {
    diario_recurrente: 'Diario recurrente (días fijos)',
    diario_unico: 'Único (un solo día)',
    semanal: 'Semanal',
    mensual: 'Mensual'
}

const HORA_OPTIONS = [
    { value: '', label: 'Sin especificar' },
    ...TIME_OPTIONS.map(time => ({ value: time, label: time }))
]
const DURACION_OPTIONS = [
    { value: '', label: 'Sin especificar' },
    ...DURATION_OPTIONS.map(minutos => ({ value: String(minutos), label: formatDuration(minutos) }))
]

const habitFormSchema = z.object({
    nombre: z.string().trim().min(1, 'El nombre es obligatorio'),
    tipo: z.enum(['diario_recurrente', 'diario_unico', 'semanal', 'mensual'])
})

type HabitFormValues = z.infer<typeof habitFormSchema>

export function HabitForm() {
    const session = useSessionStore(state => state.session)
    const [diasSemana, setDiasSemana] = useState<number[]>([])
    const [scheduleBlocks, setScheduleBlocks] = useState<EditableScheduleBlock[]>([])
    const [fecha, setFecha] = useState('')
    const [hora, setHora] = useState('')
    const [duracionMinutos, setDuracionMinutos] = useState('')
    const [color, setColor] = useState<string | null>(null)
    const [importancia, setImportancia] = useState<HabitImportancia>('media')
    const [submitError, setSubmitError] = useState<string | null>(null)
    const [showPastUnico, setShowPastUnico] = useState(false)
    const createHabitMutation = useCreateHabit()
    const { data: pastUnicoHabits } = usePastUnicoHabits()

    const {
        register,
        handleSubmit,
        watch,
        reset,
        setValue,
        formState: { errors }
    } = useForm<HabitFormValues>({
        resolver: zodResolver(habitFormSchema),
        defaultValues: { nombre: '', tipo: 'diario_recurrente' }
    })

    const tipo = watch('tipo')

    function pickPastUnico(past: { nombre: string; color: string | null; importancia: HabitImportancia }) {
        setValue('nombre', past.nombre, { shouldValidate: true })
        setColor(past.color)
        setImportancia(past.importancia)
        setShowPastUnico(false)
    }

    function changeDiasSemana(value: number[]) {
        setDiasSemana(value)
        // Un día que se destilda a nivel hábito desaparece de todos los bloques que lo tenían —
        // evita que un bloque quede referenciando un día que el hábito ya no cubre.
        setScheduleBlocks(current =>
            current
                .map(block => ({ ...block, diasSemana: block.diasSemana.filter(d => value.includes(d)) }))
                .filter(block => block.diasSemana.length > 0)
        )
    }

    async function onSubmit(values: HabitFormValues) {
        setSubmitError(null)

        if (!session && values.tipo !== 'diario_unico') {
            setSubmitError('Los hábitos recurrentes necesitan una cuenta — andá a la pestaña Amigos para registrarte.')
            return
        }

        const common = {
            ...values,
            color: color ?? undefined,
            importancia
        }

        const payload =
            values.tipo === 'diario_recurrente'
                ? { ...common, tipo: values.tipo, diasSemana, scheduleBlocks }
                : values.tipo === 'diario_unico'
                  ? {
                        ...common,
                        tipo: values.tipo,
                        fecha,
                        hora: hora || undefined,
                        duracionMinutos: duracionMinutos ? Number(duracionMinutos) : undefined
                    }
                  : {
                        ...common,
                        tipo: values.tipo,
                        hora: hora || undefined,
                        duracionMinutos: duracionMinutos ? Number(duracionMinutos) : undefined
                    }

        const parsed = createHabitSchema.safeParse(payload)
        if (!parsed.success) {
            setSubmitError(parsed.error.issues[0]?.message ?? 'Datos inválidos')
            return
        }

        await createHabitMutation.mutateAsync(parsed.data)
        reset({ nombre: '', tipo: values.tipo })
        setDiasSemana([])
        setScheduleBlocks([])
        setFecha('')
        setHora('')
        setDuracionMinutos('')
        setColor(null)
        setImportancia('media')
        setShowPastUnico(false)
    }

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className='border-border bg-surface flex flex-col gap-6 rounded-2xl border p-8'
        >
            <div className='flex flex-col gap-5'>
                <span className='text-text-muted text-xs font-semibold tracking-wider uppercase'>Hábito</span>

                <div className='flex flex-col gap-1.5'>
                    <label htmlFor='nombre' className='text-text-muted text-xs font-medium'>
                        Nombre
                    </label>
                    <input
                        id='nombre'
                        type='text'
                        {...register('nombre')}
                        className='border-border bg-bg text-text placeholder:text-text-muted rounded-lg border px-3.5 py-3 text-[15px]'
                        placeholder='Ir al gimnasio'
                    />
                    {errors.nombre && <span className='text-sm text-red-400'>{errors.nombre.message}</span>}

                    {tipo === 'diario_unico' && pastUnicoHabits && pastUnicoHabits.length > 0 && (
                        <div className='flex flex-col gap-2'>
                            <button
                                type='button'
                                onClick={() => setShowPastUnico(v => !v)}
                                className='text-text-muted hover:text-text w-fit text-xs font-medium underline'
                            >
                                {showPastUnico
                                    ? 'Ocultar hábitos anteriores'
                                    : 'Repetir un hábito de único día ya creado'}
                            </button>

                            {showPastUnico && (
                                <div className='border-border bg-bg flex flex-col gap-1 rounded-lg border p-2'>
                                    {pastUnicoHabits.map(past => (
                                        <button
                                            key={past.nombre}
                                            type='button'
                                            onClick={() => pickPastUnico(past)}
                                            className='text-text hover:bg-surface-2 rounded-md px-2.5 py-1.5 text-left text-sm'
                                        >
                                            {past.nombre}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className='flex w-72 flex-col gap-1.5'>
                    <label htmlFor='tipo' className='text-text-muted text-xs font-medium'>
                        Tipo
                    </label>
                    <SelectField id='tipo' {...register('tipo')}>
                        {Object.entries(TIPO_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>
                                {label}
                            </option>
                        ))}
                    </SelectField>
                </div>

                <div className='flex gap-8'>
                    <div className='flex flex-col gap-1.5'>
                        <span className='text-text-muted text-xs font-medium'>Importancia</span>
                        <ImportanciaSelector value={importancia} onChange={setImportancia} />
                    </div>

                    <div className='flex flex-col gap-1.5'>
                        <span className='text-text-muted text-xs font-medium'>Color (opcional)</span>
                        <ColorPickerField value={color} onChange={setColor} />
                    </div>
                </div>
            </div>

            {(tipo === 'diario_recurrente' || tipo === 'diario_unico') && (
                <div className='border-border flex flex-col gap-5 border-t pt-6'>
                    <span className='text-text-muted text-xs font-semibold tracking-wider uppercase'>Cuándo</span>

                    {tipo === 'diario_recurrente' && (
                        <div className='flex flex-col gap-1.5'>
                            <span className='text-text-muted text-xs font-medium'>Días</span>
                            <WeekdayPicker value={diasSemana} onChange={changeDiasSemana} />
                        </div>
                    )}

                    {tipo === 'diario_unico' && (
                        <div className='flex w-80 flex-col gap-1.5'>
                            <label htmlFor='fecha' className='text-text-muted text-xs font-medium'>
                                Fecha
                            </label>
                            <DatePickerField id='fecha' value={fecha} onChange={setFecha} />
                        </div>
                    )}
                </div>
            )}

            {tipo === 'diario_recurrente' ? (
                <div className='border-border flex flex-col gap-3 border-t pt-6'>
                    <span className='text-text-muted text-xs font-semibold tracking-wider uppercase'>
                        Bloques de horario (opcional)
                    </span>
                    <ScheduleBlocksEditor
                        diasSemana={diasSemana}
                        blocks={scheduleBlocks}
                        onChange={setScheduleBlocks}
                    />
                </div>
            ) : (
                <div className='border-border flex flex-col gap-3 border-t pt-6'>
                    <span className='text-text-muted text-xs font-semibold tracking-wider uppercase'>
                        Detalles opcionales
                    </span>
                    <div className='flex gap-4'>
                        <div className='flex w-40 flex-col gap-1.5'>
                            <label htmlFor='hora' className='text-text-muted text-xs font-medium'>
                                Hora
                            </label>
                            <ComboboxField id='hora' value={hora} onChange={setHora} options={HORA_OPTIONS} />
                        </div>

                        <div className='flex w-40 flex-col gap-1.5'>
                            <label htmlFor='duracionMinutos' className='text-text-muted text-xs font-medium'>
                                Duración
                            </label>
                            <ComboboxField
                                id='duracionMinutos'
                                value={duracionMinutos}
                                onChange={setDuracionMinutos}
                                options={DURACION_OPTIONS}
                            />
                        </div>
                    </div>
                </div>
            )}

            {submitError && <span className='text-sm text-red-400'>{submitError}</span>}

            <button
                type='submit'
                disabled={createHabitMutation.isPending}
                className='bg-accent text-accent-ink self-start rounded-lg px-6 py-3 text-sm font-bold disabled:opacity-50'
            >
                {createHabitMutation.isPending ? 'Creando...' : 'Crear hábito'}
            </button>
        </form>
    )
}
