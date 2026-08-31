import { addMonths, format, isSameMonth, parseISO, subMonths } from 'date-fns'
import { es } from 'date-fns/locale'
import { useEffect, useRef, useState } from 'react'

import { toDateKey } from '@/lib/date/period'
import { getMonthGridDays } from '@/modules/calendar/lib/month-grid'

const DIAS_HEADER = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

function CalendarIcon() {
    return (
        <svg
            width='15'
            height='15'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
        >
            <rect x='3' y='4' width='18' height='18' rx='2' />
            <path d='M16 2v4M8 2v4M3 10h18' />
        </svg>
    )
}

interface DatePickerFieldProps {
    id?: string
    /** Fecha en formato `YYYY-MM-DD`, o `''` sin elegir. */
    value: string
    onChange: (value: string) => void
    className?: string
}

/**
 * Selector de fecha con calendario propio, no nativo — `<input type="date">` abre el picker del
 * sistema operativo, que no tiene nada que ver con la estética de la app (calendario claro,
 * genérico). A diferencia de `ComboboxField`, el calendario NO flota por encima del resto del
 * formulario (`position: absolute`) — se inserta en el flujo normal del documento debajo del
 * botón, empujando lo que sigue hacia abajo, a pedido explícito del usuario ("no me gusta el
 * flotante, que esté hecho normal").
 */
export function DatePickerField({ id, value, onChange, className }: DatePickerFieldProps) {
    const [open, setOpen] = useState(false)
    const [monthAnchor, setMonthAnchor] = useState(() => (value ? parseISO(value) : new Date()))
    const rootRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!open) return

        function handleClickOutside(e: MouseEvent) {
            if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
        }
        function handleEscape(e: KeyboardEvent) {
            if (e.key === 'Escape') setOpen(false)
        }

        document.addEventListener('mousedown', handleClickOutside)
        document.addEventListener('keydown', handleEscape)
        setMonthAnchor(value ? parseISO(value) : new Date())

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
            document.removeEventListener('keydown', handleEscape)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps -- solo al abrir, no cada vez que cambia `value` mientras está abierto
    }, [open])

    const days = getMonthGridDays(monthAnchor)
    const todayKey = toDateKey(new Date())

    return (
        <div ref={rootRef}>
            <button
                type='button'
                id={id}
                onClick={() => setOpen(o => !o)}
                className={`border-border bg-bg text-text focus:border-accent flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors outline-none ${className ?? ''}`}
            >
                <span className={value ? 'truncate' : 'text-text-muted truncate'}>
                    {value ? format(parseISO(value), "d 'de' MMMM 'de' yyyy", { locale: es }) : 'Elegí una fecha'}
                </span>
                <span className='text-text-muted shrink-0'>
                    <CalendarIcon />
                </span>
            </button>

            {open && (
                <div className='border-border bg-surface mt-1.5 flex w-full flex-col gap-3 rounded-xl border p-4'>
                    <div className='flex items-center justify-between'>
                        <button
                            type='button'
                            onClick={() => setMonthAnchor(a => subMonths(a, 1))}
                            className='border-border text-text-muted rounded-lg border px-2.5 py-1 text-sm'
                            aria-label='Mes anterior'
                        >
                            ←
                        </button>
                        <span className='text-text font-mono text-xs font-bold tracking-wider uppercase'>
                            {format(monthAnchor, 'MMMM yyyy', { locale: es })}
                        </span>
                        <button
                            type='button'
                            onClick={() => setMonthAnchor(a => addMonths(a, 1))}
                            className='border-border text-text-muted rounded-lg border px-2.5 py-1 text-sm'
                            aria-label='Mes siguiente'
                        >
                            →
                        </button>
                    </div>

                    <div className='mt-3 grid grid-cols-7 gap-1'>
                        {DIAS_HEADER.map(label => (
                            <div
                                key={label}
                                className='text-text-muted text-center font-mono text-[10px] font-bold uppercase'
                            >
                                {label}
                            </div>
                        ))}

                        {days.map(day => {
                            const dateKey = toDateKey(day)
                            const inMonth = isSameMonth(day, monthAnchor)
                            const isToday = dateKey === todayKey
                            const isSelected = dateKey === value

                            return (
                                <button
                                    key={dateKey}
                                    type='button'
                                    onClick={() => {
                                        onChange(dateKey)
                                        setOpen(false)
                                    }}
                                    className={`flex aspect-square items-center justify-center rounded-lg text-sm transition-colors ${
                                        isSelected
                                            ? 'bg-accent text-accent-ink font-bold'
                                            : inMonth
                                              ? 'text-text hover:bg-surface-2'
                                              : 'text-text-muted hover:bg-surface-2 opacity-40'
                                    } ${isToday && !isSelected ? 'ring-accent ring-1' : ''}`}
                                >
                                    {format(day, 'd')}
                                </button>
                            )
                        })}
                    </div>

                    <div className='border-border mt-3 flex justify-between border-t pt-3 text-xs font-semibold'>
                        <button
                            type='button'
                            onClick={() => {
                                onChange('')
                                setOpen(false)
                            }}
                            className='text-text-muted hover:text-text'
                        >
                            Borrar
                        </button>
                        <button
                            type='button'
                            onClick={() => {
                                onChange(todayKey)
                                setMonthAnchor(new Date())
                                setOpen(false)
                            }}
                            className='text-accent hover:opacity-80'
                        >
                            Hoy
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
