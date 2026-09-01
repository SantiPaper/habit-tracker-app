import { addMonths, format, isSameMonth, subMonths } from 'date-fns'
import { es } from 'date-fns/locale'
import { useState } from 'react'

import type { CalendarDayItem } from '../hooks/use-month-data'
import { useMonthData } from '../hooks/use-month-data'
import { getMonthGridDays } from '../lib/month-grid'

import { toDateKey } from '@/lib/date/period'
import { EventChip } from '@/modules/events/components/event-chip'
import { useEventsInRange } from '@/modules/events/hooks/use-events-in-range'
import type { Event } from '@/modules/events/types/event.types'
import { ESTADO_BLOCK_STYLE } from '@/modules/habits/lib/estado-display'

const DIAS_HEADER = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const MAX_VISIBLE_CHIPS = 3

interface MonthDayCellProps {
    date: Date
    items: CalendarDayItem[]
    events: Event[]
    inMonth: boolean
    isToday: boolean
    onSelectDay: (date: Date) => void
}

function MonthDayCell({ date, items, events, inMonth, isToday, onSelectDay }: MonthDayCellProps) {
    // Los eventos van primero — son puntuales y menos frecuentes que los hábitos del día, así que
    // priorizarlos evita que queden ocultos detrás del cupo de +N más.
    const visibleEvents = events.slice(0, MAX_VISIBLE_CHIPS)
    const visibleHabits = items.slice(0, Math.max(0, MAX_VISIBLE_CHIPS - visibleEvents.length))
    const overflow = events.length - visibleEvents.length + (items.length - visibleHabits.length)

    return (
        // No es un <button> (como antes) porque adentro va `EventChip`, que ya es un botón propio
        // (abre su diálogo de edición) — un botón dentro de otro botón es HTML inválido. En su
        // lugar, toda la celda navega al clickearla, salvo la franja de eventos (`stopPropagation`).
        <div
            role='button'
            tabIndex={0}
            onClick={() => onSelectDay(date)}
            onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') onSelectDay(date)
            }}
            className={`border-border hover:bg-surface-2 hover:border-accent/50 flex min-h-[104px] cursor-pointer flex-col gap-1 rounded-lg border p-1.5 text-left transition-colors ${inMonth ? '' : 'opacity-40'}`}
        >
            <span className={`font-mono text-xs ${isToday ? 'text-accent font-bold' : 'text-text-muted'}`}>
                {format(date, 'd')}
            </span>

            <div className='flex flex-col gap-1'>
                {visibleEvents.length > 0 && (
                    <div className='flex flex-col gap-1' onClick={e => e.stopPropagation()}>
                        {visibleEvents.map(event => (
                            <EventChip key={event.id} event={event} variant='compact' />
                        ))}
                    </div>
                )}
                {visibleHabits.map(({ habit, estado }) => (
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
        </div>
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
    const { data: events } = useEventsInRange(toDateKey(days[0]), toDateKey(days[days.length - 1]))
    const eventsByDate = new Map<string, Event[]>()
    for (const event of events ?? []) {
        const list = eventsByDate.get(event.fecha)
        if (list) list.push(event)
        else eventsByDate.set(event.fecha, [event])
    }

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
                                events={eventsByDate.get(dateKey) ?? []}
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
