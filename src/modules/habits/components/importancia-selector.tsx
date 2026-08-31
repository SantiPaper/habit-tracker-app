import type { HabitImportancia } from '../types/habit.types'

const OPTIONS: { value: HabitImportancia; label: string }[] = [
    { value: 'alta', label: 'Alta' },
    { value: 'media', label: 'Media' },
    { value: 'baja', label: 'Baja' }
]

interface ImportanciaSelectorProps {
    value: HabitImportancia
    onChange: (value: HabitImportancia) => void
}

/** Nivel de importancia del hábito — 3 niveles fijos, se usa para ordenar la lista y como etiqueta (no reemplaza al color libre). */
export function ImportanciaSelector({ value, onChange }: ImportanciaSelectorProps) {
    return (
        <div className='flex gap-1.5'>
            {OPTIONS.map(option => (
                <button
                    key={option.value}
                    type='button'
                    onClick={() => onChange(option.value)}
                    className={`rounded-lg px-3.5 py-2 text-xs font-bold tracking-wide uppercase ${
                        value === option.value ? 'bg-accent text-accent-ink' : 'border-border text-text-muted border'
                    }`}
                >
                    {option.label}
                </button>
            ))}
        </div>
    )
}
