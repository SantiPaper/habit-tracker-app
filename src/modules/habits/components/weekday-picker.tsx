const DIAS_SEMANA = [
    { value: 0, label: 'Dom' },
    { value: 1, label: 'Lun' },
    { value: 2, label: 'Mar' },
    { value: 3, label: 'Mié' },
    { value: 4, label: 'Jue' },
    { value: 5, label: 'Vie' },
    { value: 6, label: 'Sáb' }
]

interface WeekdayPickerProps {
    value: number[]
    onChange: (value: number[]) => void
    /** Si se pasa, solo se muestran esos días (ej. el picker de un bloque, restringido a los días ya elegidos a nivel hábito). Sin esto, se muestran los 7. */
    allowedDays?: number[]
    size?: 'md' | 'sm'
}

/** Selector de días de la semana como grilla de botones toggle — reusado en el selector de nivel-hábito y en cada bloque de horario. */
export function WeekdayPicker({ value, onChange, allowedDays, size = 'md' }: WeekdayPickerProps) {
    const dias = allowedDays ? DIAS_SEMANA.filter(dia => allowedDays.includes(dia.value)) : DIAS_SEMANA
    const dimensions = size === 'md' ? 'h-10 w-10' : 'h-9 w-9'

    function toggleDia(dia: number) {
        onChange(value.includes(dia) ? value.filter(d => d !== dia) : [...value, dia].sort())
    }

    return (
        <div className='flex gap-1.5'>
            {dias.map(dia => (
                <button
                    key={dia.value}
                    type='button'
                    onClick={() => toggleDia(dia.value)}
                    className={`flex items-center justify-center rounded-lg text-xs font-bold ${dimensions} ${
                        value.includes(dia.value)
                            ? 'bg-accent text-accent-ink font-mono'
                            : 'border-border text-text-muted border'
                    }`}
                >
                    {dia.label}
                </button>
            ))}
        </div>
    )
}
