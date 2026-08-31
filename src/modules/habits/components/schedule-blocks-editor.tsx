import { TIME_OPTIONS } from '../lib/schedule-options'

import { WeekdayPicker } from './weekday-picker'

import { ComboboxField } from '@/components/combobox-field'

const TIME_SELECT_OPTIONS = TIME_OPTIONS.map(time => ({ value: time, label: time }))

export interface EditableScheduleBlock {
    diasSemana: number[]
    hora: string
    duracionMinutos: number | null
}

interface ScheduleBlocksEditorProps {
    /** Días elegidos a nivel hábito — cada bloque solo puede usar un subconjunto de estos. */
    diasSemana: number[]
    blocks: EditableScheduleBlock[]
    onChange: (blocks: EditableScheduleBlock[]) => void
}

function toMinutes(hora: string): number {
    const [h, m] = hora.split(':').map(Number)
    return h * 60 + m
}

function minutesToHora(minutes: number): string {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function TrashIcon() {
    return (
        <svg
            width='14'
            height='14'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
        >
            <polyline points='3 6 5 6 21 6' />
            <path d='M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6' />
        </svg>
    )
}

/**
 * Lista editable de bloques de horario de un hábito recurrente — cada bloque tiene su propio
 * subconjunto de días (dentro de `diasSemana`) + hora de inicio + hora de fin. 0 bloques = "sin
 * horario", 1 bloque = el caso común de siempre, N bloques = horarios distintos por día o cortes
 * en el medio. La duración se guarda en minutos (mismo dato de siempre) pero se edita como "hora
 * fin" — más natural que elegir minutos de una lista con techo fijo, y sin límite de horas.
 */
export function ScheduleBlocksEditor({ diasSemana, blocks, onChange }: ScheduleBlocksEditorProps) {
    function updateBlock(index: number, changes: Partial<EditableScheduleBlock>) {
        onChange(blocks.map((block, i) => (i === index ? { ...block, ...changes } : block)))
    }

    function removeBlock(index: number) {
        onChange(blocks.filter((_, i) => i !== index))
    }

    function addBlock() {
        onChange([...blocks, { diasSemana: [...diasSemana], hora: TIME_OPTIONS[0], duracionMinutos: null }])
    }

    return (
        <div className='flex flex-col gap-3'>
            {blocks.map((block, index) => {
                const startMinutes = toMinutes(block.hora)
                const horaFin = block.duracionMinutos != null ? minutesToHora(startMinutes + block.duracionMinutos) : ''
                const horaFinOptions = TIME_OPTIONS.filter(time => toMinutes(time) > startMinutes)

                return (
                    <div key={index} className='border-border flex flex-col gap-3 rounded-lg border p-3'>
                        <div className='flex items-start justify-between gap-3'>
                            <div className='flex min-w-0 flex-col gap-1.5'>
                                <span className='text-text-muted text-xs font-medium'>Días de este bloque</span>
                                <WeekdayPicker
                                    value={block.diasSemana}
                                    onChange={value => updateBlock(index, { diasSemana: value })}
                                    allowedDays={diasSemana}
                                    size='sm'
                                />
                            </div>

                            <button
                                type='button'
                                onClick={() => removeBlock(index)}
                                aria-label='Eliminar bloque'
                                className='text-text-muted shrink-0 hover:text-red-400'
                            >
                                <TrashIcon />
                            </button>
                        </div>

                        <div className='flex gap-3'>
                            <div className='flex flex-1 flex-col gap-1.5'>
                                <span className='text-text-muted text-xs font-medium'>Hora inicio</span>
                                <ComboboxField
                                    value={block.hora}
                                    onChange={value => updateBlock(index, { hora: value })}
                                    options={TIME_SELECT_OPTIONS}
                                />
                            </div>

                            <div className='flex flex-1 flex-col gap-1.5'>
                                <span className='text-text-muted text-xs font-medium'>Hora fin</span>
                                <ComboboxField
                                    value={horaFin}
                                    onChange={value =>
                                        updateBlock(index, {
                                            duracionMinutos: value ? toMinutes(value) - startMinutes : null
                                        })
                                    }
                                    options={[
                                        { value: '', label: 'Sin especificar' },
                                        ...horaFinOptions.map(time => ({ value: time, label: time }))
                                    ]}
                                />
                            </div>
                        </div>
                    </div>
                )
            })}

            <button
                type='button'
                onClick={addBlock}
                disabled={diasSemana.length === 0}
                className='border-border text-text-muted hover:text-text self-start rounded-lg border px-3 py-2 text-xs font-semibold disabled:opacity-50'
            >
                + Agregar bloque
            </button>
        </div>
    )
}
