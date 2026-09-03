import type { JSX } from 'react'

import type { EstadoLog } from '@/modules/habits/types/habit-log.types'

function CheckIcon() {
    return (
        <svg
            width='16'
            height='16'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='3'
            strokeLinecap='round'
            strokeLinejoin='round'
        >
            <polyline points='4 12 10 18 20 6' />
        </svg>
    )
}

function XIcon() {
    return (
        <svg
            width='14'
            height='14'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='3'
            strokeLinecap='round'
        >
            <line x1='6' y1='6' x2='18' y2='18' />
            <line x1='18' y1='6' x2='6' y2='18' />
        </svg>
    )
}

function ResetIcon() {
    return (
        <svg
            width='14'
            height='14'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2.5'
            strokeLinecap='round'
            strokeLinejoin='round'
        >
            <path d='M3 12a9 9 0 1 0 2.64-6.36' />
            <path d='M3 4v5h5' />
        </svg>
    )
}

const OPTIONS: { estado: EstadoLog; icon: () => JSX.Element; activeClass: string; label: string }[] = [
    { estado: 'cumplido', icon: CheckIcon, activeClass: 'bg-accent text-accent-ink', label: 'Cumplido' },
    {
        estado: 'no_cumplido',
        icon: XIcon,
        activeClass: 'bg-surface-2 text-text border-2 border-text-muted',
        label: 'No cumplido'
    }
]

interface EstadoToggleProps {
    value: EstadoLog | null
    /** `null` = volver a "sin marcar". */
    onChange: (estado: EstadoLog | null) => void
    /** Botones chicos (24px en vez de 36px) — para bloques de Agenda demasiado bajos como para
     * pagar el tamaño normal (ver `HabitBlock`, hábitos de pocos minutos). */
    dense?: boolean
}

export function EstadoToggle({ value, onChange, dense }: EstadoToggleProps) {
    const sizeClass = dense ? 'h-6 w-6' : 'h-9 w-9'
    const gapClass = dense ? 'gap-1' : 'gap-1.5'

    return (
        <div className={`flex ${gapClass}`}>
            {OPTIONS.map(option => (
                <button
                    key={option.estado}
                    type='button'
                    aria-label={option.label}
                    aria-pressed={value === option.estado}
                    onClick={() => onChange(option.estado)}
                    className={`flex ${sizeClass} items-center justify-center rounded-full ${
                        value === option.estado ? option.activeClass : 'border-border text-text-muted border'
                    }`}
                >
                    <option.icon />
                </button>
            ))}
            <button
                type='button'
                aria-label='Volver a sin marcar'
                title='Volver a sin marcar'
                disabled={value === null}
                onClick={() => onChange(null)}
                className={`border-border text-text-muted flex ${sizeClass} items-center justify-center rounded-full border disabled:opacity-30`}
            >
                <ResetIcon />
            </button>
        </div>
    )
}
