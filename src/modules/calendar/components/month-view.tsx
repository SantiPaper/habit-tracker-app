import { addMonths, format, isSameMonth, subMonths } from 'date-fns'
import { es } from 'date-fns/locale'
import { useState } from 'react'

import type { CalendarDayItem } from '../hooks/use-month-data'
import { useMonthData } from '../hooks/use-month-data'
import { getMonthGridDays } from '../lib/month-grid'

import { toDateKey } from '@/lib/date/period'
import { ESTADO_BLOCK_STYLE } from '@/modules/habits/lib/estado-display'

const DIAS_HEADER = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const MAX_VISIBLE_CHIPS = 3

interface MonthDayCellProps {
    date: Date
    items: CalendarDayItem[]
    inMonth: boolean
    isToday: boolean
    onSelectDay: (date: Date) => void
}

function MonthDayCell({ date, items, inMonth, isToday, onSelectDay }: MonthDayCellProps) {
    const visible = items.slice(0, MAX_VISIBLE_CHIPS)
    const overflow = items.length - visible.length

    return (
        <button
            type='button'
            onClick={() => onSelectDay(date)}
            className={`border-border hover:bg-surface-2 hover:border-accent/50 flex min-h-[104px] flex-col gap-1 rounded-lg border p-1.5 text-left transition-colors ${inMonth ? '' : 'opacity-40'}`}
        >
            <span className={`font-mono text-xs ${isToday ? 'text-accent font-bold' : 'text-text-muted'}`}>
                {format(date, 'd')}
            </span>

            <div className='flex flex-col gap-1'>
                {visible.map(({ habit, estado }) => (
                    <div
                        key={habit.id}
                        title={habit.nombre}
                        className={`truncate rounded border border-l-[3px] px-1.5 py-0.5 text-left text-[10px] font-semibold ${ESTADO_BLOCK_STYLE[estado ?? 'null']}`}
                        style={habit.color ? { borderLeftColor: habit.color } : undefined}
                    >
                        {habit.nombre}
                    </div>
                ))}
                {overflow > 0 && <span className='text-text-muted px-1 font-mono text-[10px]'>+{overflow} más</span>}
            </div>
        </button>
    )
}

interface MonthViewProps {
    onSelectDay: (date: Date) => void
}

/** Vista Mes: calendario grande, solo de lectura — pasás el mouse sobre un día y lo clickeás para ir a la vista Día de esa fecha. */
export function MonthView({ onSelectDay }: MonthViewProps) {
    const [monthAnchor, setMonthAnchor] = useState(new Date())
    const { data, isLoading, error } = useMonthData(monthAnchor)
    const days = getMonthGridDays(monthAnchor)
    const todayKey = toDateKey(new Date())

    return (
        <div className='flex flex-col gap-4'>
            <div className='flex items-center justify-between'>
                <button
                    type='button'
                    onClick={() => setMonthAnchor(a => subMonths(a, 1))}
                    className='border-border text-text-muted rounded-lg border px-3 py-1.5 text-sm'
                    aria-label='Mes anterior'
                >
                    ←
                </button>
                <span className='text-text font-mono text-sm font-bold tracking-wider uppercase'>
                    {format(monthAnchor, 'MMMM yyyy', { locale: es })}
                </span>
                <button
                    type='button'
                    onClick={() => setMonthAnchor(a => addMonths(a, 1))}
                    className='border-border text-text-muted rounded-lg border px-3 py-1.5 text-sm'
                    aria-label='Mes siguiente'
                >
                    →
                </button>
            </div>

            {isLoading && <p className='text-text-muted'>Cargando...</p>}
            {error && <p className='text-red-400'>Error al cargar la agenda</p>}

            {data && (
                <div className='grid grid-cols-7 gap-1.5'>
                    {DIAS_HEADER.map(label => (
                        <div
                            key={label}
                            className='text-text-muted text-center font-mono text-[11px] font-bold uppercase'
                        >
                            {label}
                        </div>
                    ))}

                    {days.map(day => {
                        const dateKey = toDateKey(day)
                        return (
                            <MonthDayCell
                                key={dateKey}
                                date={day}
                                items={data.get(dateKey) ?? []}
                                inMonth={isSameMonth(day, monthAnchor)}
                                isToday={dateKey === todayKey}
                                onSelectDay={onSelectDay}
                            />
                        )
                    })}
                </div>
            )}
        </div>
    )
}
