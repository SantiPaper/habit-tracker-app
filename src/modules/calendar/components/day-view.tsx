import { addDays, format, parseISO, subDays } from 'date-fns'
import { es } from 'date-fns/locale'
import type { CSSProperties } from 'react'
import { useState } from 'react'

import { HabitBlock } from './habit-block'
import { MonthCalendar } from './month-calendar'
import { TimeGridShell } from './time-grid-shell'

import { toDateKey } from '@/lib/date/period'
import { useFlashOnTrue } from '@/lib/hooks/use-flash-on-true'
import { useNow } from '@/lib/hooks/use-now'
import { useMonthData } from '@/modules/calendar/hooks/use-month-data'
import {
    computeBlockGeometry,
    DEFAULT_VISUAL_DURATION_MIN,
    layoutOverlaps,
    parseHoraToMinutes
} from '@/modules/calendar/lib/time-grid'
import type { HabitOnDateItem } from '@/modules/daily/hooks/use-habits-for-date'
import { useHabitsForDate } from '@/modules/daily/hooks/use-habits-for-date'
import { useSetHabitLog } from '@/modules/daily/hooks/use-set-habit-log'
import { EventChip } from '@/modules/events/components/event-chip'
import { useEventsForDate } from '@/modules/events/hooks/use-events-for-date'
import { ESTADO_BLOCK_STYLE, cycleEstado } from '@/modules/habits/lib/estado-display'
import { isImportanceOverdue } from '@/modules/habits/lib/importance-alert'
import { getBlocksForDate } from '@/modules/habits/lib/schedule-blocks'
import type { EstadoLog } from '@/modules/habits/types/habit-log.types'
import type { Habit } from '@/modules/habits/types/habit.types'
import { useImportanciaColors } from '@/modules/profile/hooks/use-importancia-colors'

interface UnscheduledChipProps {
    habit: Habit
    estado: EstadoLog | null
    isToday: boolean
    onToggle: () => void
}

/** Chip de la franja "sin horario" — componente propio porque necesita sus propios hooks de destello/alerta, y esos no se pueden llamar dentro de un `.map()`. */
function UnscheduledChip({ habit, estado, isToday, onToggle }: UnscheduledChipProps) {
    const flashing = useFlashOnTrue(estado === 'cumplido')
    const now = useNow()
    const { data: importanciaColors } = useImportanciaColors()
    const overdue = isToday && isImportanceOverdue(habit, estado, now, [])
    const alertColor = importanciaColors?.alta

    return (
        <button
            type='button'
            onClick={onToggle}
            title={habit.nombre}
            className={`truncate rounded-lg border border-l-4 px-3 py-2 text-left text-[13px] font-semibold ${ESTADO_BLOCK_STYLE[estado ?? 'null']} ${flashing ? 'spark-pulse' : ''} ${overdue ? 'importance-alert-pulse' : ''}`}
            style={
                {
                    ...(habit.color ? { borderLeftColor: habit.color } : undefined),
                    ...(flashing ? { '--spark-color': habit.color ?? 'var(--color-accent)' } : undefined),
                    ...(overdue && alertColor ? { '--alert-color': alertColor } : undefined)
                } as CSSProperties
            }
        >
            {habit.nombre}
        </button>
    )
}

interface DayViewProps {
    /** Fecha con la que arranca la vista — cuando se navega acá desde Semana/Mes. Por defecto, hoy. */
    initialDate?: Date
}

export function DayView({ initialDate }: DayViewProps) {
    const [date, setDate] = useState(() => initialDate ?? new Date())
    const [monthAnchor, setMonthAnchor] = useState(() => initialDate ?? new Date())
    const dateKey = toDateKey(date)
    const todayKey = toDateKey(new Date())

    const { data: items, isLoading } = useHabitsForDate(date)
    const { data: events } = useEventsForDate(date)
    const setHabitLogMutation = useSetHabitLog(dateKey)
    const { data: monthData } = useMonthData(monthAnchor)

    const goToDate = (d: Date) => {
        setDate(d)
        setMonthAnchor(d)
    }

    const itemsWithBlocks = (items ?? []).map((item: HabitOnDateItem) => ({
        item,
        blocks: getBlocksForDate(item.habit, date)
    }))
    const unscheduled = itemsWithBlocks.filter(({ blocks }) => blocks.length === 0).map(({ item }) => item)

    const laidOut = layoutOverlaps(
        itemsWithBlocks.flatMap(({ item, blocks }) =>
            blocks.map(block => {
                const startMin = parseHoraToMinutes(block.hora)
                const endMin = startMin + (block.duracionMinutos ?? DEFAULT_VISUAL_DURATION_MIN)
                return {
                    item,
                    hora: block.hora,
                    duracionMinutos: block.duracionMinutos,
                    blocksToday: blocks,
                    startMin,
                    endMin
                }
            })
        )
    )

    return (
        <div className='flex items-start gap-8'>
            {monthData && (
                <div className='w-[340px] shrink-0'>
                    <MonthCalendar
                        monthAnchor={monthAnchor}
                        onMonthAnchorChange={setMonthAnchor}
                        data={monthData}
                        selectedDateKey={dateKey}
                        onSelectDate={key => goToDate(parseISO(key))}
                    />
                </div>
            )}

            <div className='max-w-4xl min-w-0 flex-1'>
                {(unscheduled.length > 0 || (events && events.length > 0)) && (
                    <div className='fixed top-44 right-8 flex w-64 flex-col gap-2'>
                        <span className='text-text-muted text-xs font-semibold tracking-wider uppercase'>
                            Sin horario
                        </span>
                        {events?.map(event => (
                            <EventChip key={event.id} event={event} />
                        ))}
                        {unscheduled.map(({ habit, estado }) => (
                            <UnscheduledChip
                                key={habit.id}
                                habit={habit}
                                estado={estado}
                                isToday={dateKey === todayKey}
                                onToggle={() =>
                                    setHabitLogMutation.mutate({ habitId: habit.id, estado: cycleEstado(estado) })
                                }
                            />
                        ))}
                    </div>
                )}

                <div className='flex flex-col gap-4'>
                    <div className='flex items-center justify-between'>
                        <button
                            type='button'
                            onClick={() => goToDate(subDays(date, 1))}
                            className='border-border text-text-muted rounded-lg border px-3 py-1.5 text-sm'
                            aria-label='Día anterior'
                        >
                            ←
                        </button>
                        <span className='text-text font-mono text-sm font-bold tracking-wider uppercase'>
                            {format(date, "EEEE d 'de' MMMM", { locale: es })}
                        </span>
                        <button
                            type='button'
                            onClick={() => goToDate(addDays(date, 1))}
                            className='border-border text-text-muted rounded-lg border px-3 py-1.5 text-sm'
                            aria-label='Día siguiente'
                        >
                            →
                        </button>
                    </div>

                    {isLoading && <p className='text-text-muted'>Cargando...</p>}

                    {!isLoading && items?.length === 0 && (
                        <p className='text-text-muted'>No había hábitos programados este día.</p>
                    )}

                    <TimeGridShell
                        columns={[
                            {
                                key: dateKey,
                                isToday: dateKey === todayKey,
                                children: laidOut.map(({ item: slot, column, columnCount }, index) => (
                                    <HabitBlock
                                        key={`${slot.item.habit.id}-${slot.hora}-${index}`}
                                        habit={slot.item.habit}
                                        estado={slot.item.estado}
                                        hora={slot.hora}
                                        duracionMinutos={slot.duracionMinutos}
                                        blocksToday={slot.blocksToday}
                                        geometry={computeBlockGeometry(slot.hora, slot.duracionMinutos)}
                                        column={column}
                                        columnCount={columnCount}
                                        variant='full'
                                        isToday={dateKey === todayKey}
                                        onChange={newEstado =>
                                            setHabitLogMutation.mutate({
                                                habitId: slot.item.habit.id,
                                                estado: newEstado
                                            })
                                        }
                                    />
                                ))
                            }
                        ]}
                    />
                </div>
            </div>
        </div>
    )
}
