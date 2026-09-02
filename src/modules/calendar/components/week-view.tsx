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
    maxHeightsByNextInColumn,
    parseHoraToMinutes
} from '@/modules/calendar/lib/time-grid'
import {
    showEvents,
    showHabits,
    showProjects,
    type AgendaViewFilter
} from '@/modules/calendar/types/agenda-view-filter'
import { useEventsInRange } from '@/modules/events/hooks/use-events-in-range'
import { useScheduleExceptionsInRange } from '@/modules/habits/hooks/use-schedule-exceptions-in-range'
import { getBlocksForDate } from '@/modules/habits/lib/schedule-blocks'
import type { HabitScheduleException } from '@/modules/habits/services/habit-schedule-exception.service'
import { useProjectsDueInRange } from '@/modules/projects/hooks/use-projects-due-in-range'

interface WeekDayGridColumnProps {
    date: Date
    items: CalendarDayItem[]
    exceptionByHabitId: Map<string, HabitScheduleException>
}

function WeekDayGridColumn({ date, items, exceptionByHabitId }: WeekDayGridColumnProps) {
    const laidOut = layoutOverlaps(
        items.flatMap(item => {
            const exception =
                item.habit.tipo === 'diario_recurrente' ? exceptionByHabitId.get(item.habit.id) : undefined
            const blocks = exception
                ? [{ hora: exception.hora, duracionMinutos: exception.duracionMinutos }]
                : getBlocksForDate(item.habit, date)
            return blocks.map(block => {
                const startMin = parseHoraToMinutes(block.hora)
                const endMin = startMin + (block.duracionMinutos ?? DEFAULT_VISUAL_DURATION_MIN)
                return { item, hora: block.hora, duracionMinutos: block.duracionMinutos, startMin, endMin }
            })
        })
    )
    const maxHeights = maxHeightsByNextInColumn(laidOut)

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
                    maxHeightPx={maxHeights[index]}
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
    viewFilter?: AgendaViewFilter
}

/** Vista Semana: solo de lectura — clickear el encabezado de un día lleva a la vista Día de esa fecha. */
export function WeekView({ onSelectDay, viewFilter = 'todos' }: WeekViewProps) {
    const [weekAnchor, setWeekAnchor] = useState(() => new Date())
    const { data, isLoading } = useWeekData(weekAnchor)
    const days = getWeekDays(weekAnchor)
    const todayKey = toDateKey(new Date())
    const { data: events } = useEventsInRange(toDateKey(days[0]), toDateKey(days[days.length - 1]))
    const { data: projects } = useProjectsDueInRange(toDateKey(days[0]), toDateKey(days[days.length - 1]))
    const { data: exceptions } = useScheduleExceptionsInRange(toDateKey(days[0]), toDateKey(days[days.length - 1]))

    const dayEntries = days.map(date => {
        const dateKey = toDateKey(date)
        return {
            date,
            dateKey,
            items: showHabits(viewFilter) ? (data?.get(dateKey) ?? []) : [],
            events: showEvents(viewFilter) ? (events?.filter(event => event.fecha === dateKey) ?? []) : [],
            projects: showProjects(viewFilter) ? (projects?.filter(project => project.deadline === dateKey) ?? []) : [],
            exceptionByHabitId: new Map(
                (exceptions ?? []).filter(exc => exc.fecha === dateKey).map(exc => [exc.habitId, exc])
            )
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
                        columns={dayEntries.map(({ date, dateKey, items, exceptionByHabitId }) => ({
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
                            children: (
                                <WeekDayGridColumn date={date} items={items} exceptionByHabitId={exceptionByHabitId} />
                            )
                        }))}
                    />
                </>
            )}
        </div>
    )
}
