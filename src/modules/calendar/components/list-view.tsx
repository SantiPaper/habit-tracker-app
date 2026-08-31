import { addDays, format, parseISO, subDays } from 'date-fns'
import { es } from 'date-fns/locale'
import { useState } from 'react'

import { MonthCalendar } from './month-calendar'

import { toDateKey } from '@/lib/date/period'
import { useMonthData } from '@/modules/calendar/hooks/use-month-data'
import { DailyCheckoffItem } from '@/modules/daily/components/daily-checkoff-item'
import { useHabitsForDate } from '@/modules/daily/hooks/use-habits-for-date'
import { useSetHabitLog } from '@/modules/daily/hooks/use-set-habit-log'
import { getBlocksForDate } from '@/modules/habits/lib/schedule-blocks'

/**
 * La vista original de Agenda: lista simple del día, sin grilla horaria — para quien prefiere
 * solo tildar sin pensar en horarios. Suma de vuelta el calendario chico flotante para saltar
 * de día con un click, además de las flechas anterior/siguiente.
 */
export function ListView() {
    const [date, setDate] = useState(() => new Date())
    const [monthAnchor, setMonthAnchor] = useState(() => new Date())
    const dateKey = toDateKey(date)
    const todayKey = toDateKey(new Date())

    const { data: items, isLoading } = useHabitsForDate(date)
    const setHabitLogMutation = useSetHabitLog(dateKey)
    const { data: monthData } = useMonthData(monthAnchor)

    const goToDate = (d: Date) => {
        setDate(d)
        setMonthAnchor(d)
    }

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

            <div className='flex max-w-2xl min-w-0 flex-1 flex-col gap-4'>
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

                <div className='flex flex-col gap-2.5'>
                    {items?.map(({ habit, estado }) => (
                        <DailyCheckoffItem
                            key={habit.id}
                            habit={habit}
                            estado={estado}
                            blocks={getBlocksForDate(habit, date)}
                            isToday={dateKey === todayKey}
                            onChange={newEstado => setHabitLogMutation.mutate({ habitId: habit.id, estado: newEstado })}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}
