import { addWeeks, format, subWeeks } from 'date-fns'
import { es } from 'date-fns/locale'
import { useState } from 'react'

import { HabitBlock } from './habit-block'
import { TimeGridShell } from './time-grid-shell'
import { UnscheduledStrip } from './unscheduled-strip'

import { toDateKey } from '@/lib/date/period'
import type { CalendarDayItem } from '@/modules/calendar/hooks/use-month-data'
import { getWeekDays, useWeekData } from '@/modules/calendar/hooks/use-week-data'
import {
    computeBlockGeometry,
    DEFAULT_VISUAL_DURATION_MIN,
    layoutOverlaps,
    parseHoraToMinutes
} from '@/modules/calendar/lib/time-grid'
import { useEventsInRange } from '@/modules/events/hooks/use-events-in-range'
import { getBlocksForDate } from '@/modules/habits/lib/schedule-blocks'
import { useProjectsDueInRange } from '@/modules/projects/hooks/use-projects-due-in-range'

interface WeekDayGridColumnProps {
    date: Date
    items: CalendarDayItem[]
}

function WeekDayGridColumn({ date, items }: WeekDayGridColumnProps) {
    const laidOut = layoutOverlaps(
        items.flatMap(item =>
            getBlocksForDate(item.habit, date).map(block => {
                const startMin = parseHoraToMinutes(block.hora)
                const endMin = startMin + (block.duracionMinutos ?? DEFAULT_VISUAL_DURATION_MIN)
                return { item, hora: block.hora, duracionMinutos: block.duracionMinutos, startMin, endMin }
            })
        )
    )

    return (
        <>
            {laidOut.map(({ item: slot, column, columnCount }, index) => (
                <HabitBlock
                    key={`${slot.item.habit.id}-${slot.hora}-${index}`}
                    habit={slot.item.habit}
                    estado={slot.item.estado}
                    hora={slot.hora}
                    duracionMinutos={slot.duracionMinutos}
                    geometry={computeBlockGeometry(slot.hora, slot.duracionMinutos)}
                    column={column}
                    columnCount={columnCount}
                    variant='compact'
                />
            ))}
        </>
    )
}

interface WeekViewProps {
    onSelectDay: (date: Date) => void
}

/** Vista Semana: solo de lectura — clickear el encabezado de un día lleva a la vista Día de esa fecha. */
export function WeekView({ onSelectDay }: WeekViewProps) {
    const [weekAnchor, setWeekAnchor] = useState(() => new Date())
    const { data, isLoading } = useWeekData(weekAnchor)
    const days = getWeekDays(weekAnchor)
    const todayKey = toDateKey(new Date())
    const { data: events } = useEventsInRange(toDateKey(days[0]), toDateKey(days[days.length - 1]))
    const { data: projects } = useProjectsDueInRange(toDateKey(days[0]), toDateKey(days[days.length - 1]))

    const dayEntries = days.map(date => {
        const dateKey = toDateKey(date)
        return {
            date,
            dateKey,
            items: data?.get(dateKey) ?? [],
            events: events?.filter(event => event.fecha === dateKey) ?? [],
            projects: projects?.filter(project => project.deadline === dateKey) ?? []
        }
    })

    return (
        <div className='flex flex-col gap-4'>
            <div className='flex items-center justify-between'>
                <button
                    type='button'
                    onClick={() => setWeekAnchor(a => subWeeks(a, 1))}
                    className='border-border text-text-muted rounded-lg border px-3 py-1.5 text-sm'
                    aria-label='Semana anterior'
                >
                    ←
                </button>
                <span className='text-text font-mono text-sm font-bold tracking-wider uppercase'>
                    {format(days[0], 'd MMM', { locale: es })} – {format(days[6], 'd MMM yyyy', { locale: es })}
                </span>
                <button
                    type='button'
                    onClick={() => setWeekAnchor(a => addWeeks(a, 1))}
                    className='border-border text-text-muted rounded-lg border px-3 py-1.5 text-sm'
                    aria-label='Semana siguiente'
                >
                    →
                </button>
            </div>

            {isLoading && <p className='text-text-muted'>Cargando...</p>}

            {data && (
                <>
                    <UnscheduledStrip days={dayEntries} />

                    <TimeGridShell
                        columns={dayEntries.map(({ date, dateKey, items }) => ({
                            key: dateKey,
                            isToday: dateKey === todayKey,
                            header: (
                                <button
                                    type='button'
                                    onClick={() => onSelectDay(date)}
                                    className='hover:bg-surface-2 flex w-full flex-col items-center gap-0.5 rounded-md py-1 transition-colors'
                                >
                                    <span className='text-text-muted font-mono text-[10px] uppercase'>
                                        {format(date, 'EEE', { locale: es })}
                                    </span>
                                    <span
                                        className={`font-mono text-xs font-bold ${dateKey === todayKey ? 'text-accent' : 'text-text'}`}
                                    >
                                        {format(date, 'd')}
                                    </span>
                                </button>
                            ),
                            onSelect: () => onSelectDay(date),
                            children: <WeekDayGridColumn date={date} items={items} />
                        }))}
                    />
                </>
            )}
        </div>
    )
}
