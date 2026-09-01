import type { CalendarDayItem } from '../hooks/use-month-data'

import { EventChip } from '@/modules/events/components/event-chip'
import type { Event } from '@/modules/events/types/event.types'
import { ESTADO_BLOCK_STYLE } from '@/modules/habits/lib/estado-display'
import { getBlocksForDate } from '@/modules/habits/lib/schedule-blocks'

interface UnscheduledStripProps {
    days: { date: Date; dateKey: string; items: CalendarDayItem[]; events?: Event[] }[]
}

/** Franja "sin horario" de la vista Semana: una columna por día con los eventos y hábitos sin horario ese día, solo de lectura (los eventos sí abren su diálogo de edición al clickear). */
export function UnscheduledStrip({ days }: UnscheduledStripProps) {
    const dayGroups = days.map(day => ({
        ...day,
        unscheduled: day.items.filter(item => getBlocksForDate(item.habit, day.date).length === 0)
    }))

    const anyContent = dayGroups.some(day => day.unscheduled.length > 0 || (day.events?.length ?? 0) > 0)
    if (!anyContent) return null

    return (
        <div className='border-border bg-surface flex gap-2 rounded-2xl border p-2.5'>
            {dayGroups.map(day => (
                <div key={day.dateKey} className='flex min-w-0 flex-1 flex-col gap-1'>
                    {day.events?.map(event => (
                        <EventChip key={event.id} event={event} variant='compact' />
                    ))}
                    {day.unscheduled.map(({ habit, estado }) => (
                        <div
                            key={habit.id}
                            title={habit.nombre}
                            className={`truncate rounded-md border border-l-[3px] px-1.5 py-1 text-left text-[10px] font-semibold ${ESTADO_BLOCK_STYLE[estado ?? 'null']}`}
                            style={habit.color ? { borderLeftColor: habit.color } : undefined}
                        >
                            {habit.nombre}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    )
}
